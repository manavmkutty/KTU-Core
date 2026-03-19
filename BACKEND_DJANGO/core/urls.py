from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurriculumViewSet, ResourceViewSet, chat_proxy, chat_clear_proxy

router = DefaultRouter()
router.register(r'curriculum', CurriculumViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', chat_proxy, name='chat_proxy'),
    path('chat/clear/', chat_clear_proxy, name='chat_clear_proxy'),
]
