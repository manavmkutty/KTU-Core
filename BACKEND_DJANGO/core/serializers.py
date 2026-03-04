from rest_framework import serializers
from .models import Curriculum, Subject, Resource

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'credit']

class CurriculumSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = Curriculum
        fields = ['id', 'scheme', 'dept', 'semester', 'subjects']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'
