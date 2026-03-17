import requests
from rest_framework import viewsets, response, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.conf import settings
from .models import Curriculum, Subject, Resource
from .serializers import CurriculumSerializer, SubjectSerializer, ResourceSerializer

CHATBOT_MICROSERVICE_URL = "http://localhost:8001"

class CurriculumViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Curriculum.objects.all()
    serializer_class = CurriculumSerializer

    @action(detail=False, methods=['get'])
    def schemes(self, request):
        schemes = Curriculum.objects.values_list('scheme', flat=True).distinct()
        return response.Response(list(schemes))

    @action(detail=False, methods=['get'], url_path='(?P<scheme>[^/.]+)/(?P<dept>[^/.]+)/(?P<semester>[^/.]+)')
    def subjects_list(self, request, scheme=None, dept=None, semester=None):
        try:
            curriculum = Curriculum.objects.prefetch_related('subjects').get(
                scheme=scheme, dept=dept, semester=semester
            )
            serializer = SubjectSerializer(curriculum.subjects.all(), many=True)
            return response.Response(serializer.data)
        except Curriculum.DoesNotExist:
            return response.Response({'error': 'Curriculum not found'}, status=status.HTTP_404_NOT_FOUND)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

    def get_queryset(self):
        queryset = Resource.objects.all()
        scheme = self.request.query_params.get('scheme')
        dept = self.request.query_params.get('dept')
        semester = self.request.query_params.get('semester')
        subject_name = self.request.query_params.get('subject_name')

        if scheme:
            queryset = queryset.filter(scheme=scheme)
        if dept:
            queryset = queryset.filter(dept=dept)
        if semester:
            queryset = queryset.filter(semester=semester)
        if subject_name:
            queryset = queryset.filter(subject_name=subject_name)
            
        return queryset

class ChatbotView(APIView):
    def post(self, request):
        user_message = request.data.get('user_message')
        session_id = request.data.get('session_id')
        
        if not user_message or not session_id:
            return response.Response(
                {'error': 'Both session_id and user_message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            res = requests.post(f"{CHATBOT_MICROSERVICE_URL}/chat", json={
                "session_id": session_id,
                "user_message": user_message
            })
            res.raise_for_status()
            return response.Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return response.Response(
                {'error': f"Failed to connect to Chatbot microservice: {str(e)}"}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

class ChatbotClearSessionView(APIView):
    def delete(self, request, session_id):
        if not session_id:
            return response.Response(
                {'error': 'session_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            res = requests.delete(f"{CHATBOT_MICROSERVICE_URL}/chat/session/{session_id}")
            res.raise_for_status()
            return response.Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return response.Response(
                {'error': f"Failed to clear session on Chatbot microservice: {str(e)}"}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
