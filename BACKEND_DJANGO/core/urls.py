from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurriculumViewSet, ResourceViewSet

router = DefaultRouter()
router.register(r'curriculum', CurriculumViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
