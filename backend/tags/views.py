from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Tag, TaskTag
from .serializers import TagSerializer, TaskTagSerializer
from tasks.models import Task
from core.utils import log_grc_event


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's tags.
    """
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        tag = serializer.save(owner=self.request.user)
        log_grc_event(self.request.user, 'CREATE', 'TAG', tag.id)

    def perform_update(self, serializer):
        tag = serializer.save()
        log_grc_event(self.request.user, 'UPDATE', 'TAG', tag.id)

    def perform_destroy(self, instance):
        tag_id = instance.id
        instance.delete()
        log_grc_event(self.request.user, 'DELETE', 'TAG', tag_id)


class TaskTagViewSet(viewsets.ViewSet):
    """
    ViewSet for managing tags on a specific task.
    Nested under /api/tasks/{task_id}/tags/
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, task_pk=None):
        """List all tags for a task."""
        task = get_object_or_404(Task, pk=task_pk, owner=request.user)
        task_tags = TaskTag.objects.filter(task=task).select_related('tag')
        serializer = TaskTagSerializer(task_tags, many=True)
        return Response(serializer.data)

    def create(self, request, task_pk=None):
        """Add a tag to a task."""
        task = get_object_or_404(Task, pk=task_pk, owner=request.user)
        tag_id = request.data.get('tag_id')
        
        if not tag_id:
            return Response({'tag_id': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        tag = get_object_or_404(Tag, pk=tag_id, owner=request.user)
        
        task_tag, created = TaskTag.objects.get_or_create(task=task, tag=tag)
        
        if created:
            log_grc_event(request.user, 'CREATE', 'TASK_TAG', task_tag.id, {'task_id': str(task.id), 'tag_id': str(tag.id)})
        
        serializer = TaskTagSerializer(task_tag)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def destroy(self, request, task_pk=None, pk=None):
        """Remove a tag from a task."""
        task = get_object_or_404(Task, pk=task_pk, owner=request.user)
        task_tag = get_object_or_404(TaskTag, task=task, tag_id=pk)
        
        task_tag_id = task_tag.id
        task_tag.delete()
        log_grc_event(request.user, 'DELETE', 'TASK_TAG', task_tag_id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
