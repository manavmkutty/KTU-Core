from rest_framework import viewsets, response, status
from rest_framework.decorators import action, api_view
from .models import Curriculum, Subject, Resource
from .serializers import CurriculumSerializer, SubjectSerializer, ResourceSerializer
import requests
import json

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

@api_view(['POST'])
def chat_proxy(request):
    """
    Forwards the chat query to the Chatbot microservice running on port 8001.
    """
    message = request.data.get('message')
    if not message:
        return response.Response({'error': 'Message field is missing.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Assuming the FastAPI server is running locally on port 8001
        chatbot_url = 'http://localhost:8001/chat'
        chatbot_res = requests.post(chatbot_url, json={'message': message}, timeout=30)
        
        if chatbot_res.status_code == 200:
            return response.Response(chatbot_res.json(), status=status.HTTP_200_OK)
        else:
            return response.Response(
                {'error': 'Error from Chatbot service', 'details': chatbot_res.text}, 
                status=chatbot_res.status_code
            )
    except requests.exceptions.RequestException as e:
        return response.Response(
            {'error': 'Failed to connect to Chatbot service', 'details': str(e)}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['POST'])
def chat_clear_proxy(request):
    """
    Forwards the clear chat history command to the Chatbot microservice.
    """
    try:
        chatbot_url = 'http://localhost:8001/chat/clear'
        chatbot_res = requests.post(chatbot_url, timeout=10)
        
        if chatbot_res.status_code == 200:
            return response.Response(chatbot_res.json(), status=status.HTTP_200_OK)
        else:
            return response.Response(
                {'error': 'Error from Chatbot service', 'details': chatbot_res.text}, 
                status=chatbot_res.status_code
            )
    except requests.exceptions.RequestException as e:
        return response.Response(
            {'error': 'Failed to connect to Chatbot service', 'details': str(e)}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
