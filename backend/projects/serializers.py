from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=1, max_length=100)
    description = serializers.CharField(max_length=1000, allow_blank=True, required=False)

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')
