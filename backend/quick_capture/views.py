from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from pydantic import ValidationError

from .models import QuickNote
from .serializers import QuickNoteSerializer
from .schemas import QuickNoteCreateSchema, QuickNoteUpdateSchema, ConvertToTaskSchema
from tasks.models import Task
from tasks.serializers import TaskSerializer
from core.mixins import PydanticValidationMixin


class QuickNoteViewSet(PydanticValidationMixin, viewsets.ModelViewSet):
    serializer_class = QuickNoteSerializer
    permission_classes = [IsAuthenticated]
    
    # Pydantic schemas
    pydantic_create_schema = QuickNoteCreateSchema
    pydantic_update_schema = QuickNoteUpdateSchema

    def get_queryset(self):
        queryset = QuickNote.objects.filter(user=self.request.user)
        archived = self.request.query_params.get('archived', None)
        if archived is not None:
            is_archived = archived.lower() == 'true'
            queryset = queryset.filter(is_archived=is_archived)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def convert_to_task(self, request, pk=None):
        note = self.get_object()
        
        if note.converted_task:
            return Response(
                {"detail": "Note already converted to a task"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Pydantic validation for conversion data
        try:
            validated = ConvertToTaskSchema(**request.data)
        except ValidationError as e:
            errors = {err['loc'][0]: err['msg'] for err in e.errors()}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Create task from note content
        task_data = {
            'title': validated.title or note.content[:50],
            'description': validated.description or note.content,
            'owner': request.user.id,
            'status': validated.status,
            'priority': validated.priority,
        }
        
        if validated.project:
            task_data['project'] = validated.project

        task_serializer = TaskSerializer(data=task_data, context={'request': request})
        if task_serializer.is_valid():
            task = task_serializer.save(owner=request.user)
            
            # Link back to note
            note.converted_task = task
            note.is_archived = True
            note.save()
            
            return Response(QuickNoteSerializer(note).data)
        else:
            return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
