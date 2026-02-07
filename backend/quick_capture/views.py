from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import QuickNote
from .serializers import QuickNoteSerializer
from tasks.models import Task
from tasks.serializers import TaskSerializer

class QuickNoteViewSet(viewsets.ModelViewSet):
    serializer_class = QuickNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only non-archived notes by default, or all if requested?
        # Let's stick to active notes usually, but maybe 'archived' filter
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

        # Create task from note content
        # We can accept additional data in the request body for the task (like project, due_date)
        task_data = {
            'title': request.data.get('title', note.content[:50]), # Default title to start of note
            'description': request.data.get('description', note.content),
            'owner': request.user.id,
            # Add other defaults or request data as needed
            'status': 'backlog',
            'priority': 'Medium',
        }
        
        # Merge with other task fields if provided
        for key in ['priority', 'status', 'project', 'due_date']:
            if key in request.data:
                task_data[key] = request.data[key]

        task_serializer = TaskSerializer(data=task_data, context={'request': request})
        if task_serializer.is_valid():
            task = task_serializer.save(owner=request.user)
            
            # Link back to note
            note.converted_task = task
            note.is_archived = True # Auto-archive after conversion
            note.save()
            
            return Response(QuickNoteSerializer(note).data)
        else:
            return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
