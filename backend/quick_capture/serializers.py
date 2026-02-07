from rest_framework import serializers
from .models import QuickNote
from tasks.serializers import TaskSerializer

class QuickNoteSerializer(serializers.ModelSerializer):
    converted_task_details = TaskSerializer(source='converted_task', read_only=True)

    class Meta:
        model = QuickNote
        fields = [
            'id', 
            'content', 
            'is_archived', 
            'converted_task', 
            'converted_task_details',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'converted_task']
