from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurriculumViewSet, ResourceViewSet, ChatbotView, ChatbotClearSessionView

router = DefaultRouter()
router.register(r'curriculum', CurriculumViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', ChatbotView.as_view(), name='chatbot_chat'),
    path('chat/clear/<str:session_id>/', ChatbotClearSessionView.as_view(), name='chatbot_clear_session'),
]
