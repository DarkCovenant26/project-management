from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for activity logs.
    GRC: Logs are immutable - no update/delete operations.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get activity logs for the current user."""
        return ActivityLog.objects.filter(actor=self.request.user).order_by('-created_at')[:50]

    from rest_framework.decorators import action
    @action(detail=False, methods=['post'])
    def log_event(self, request):
        """Allow manual logging for GRC audit trail from frontend."""
        data = request.data.copy()
        data['actor'] = request.user.id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save(actor=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class TaskActivityViewSet(viewsets.ViewSet):
    """Get activity logs for a specific task."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, task_pk=None):
        logs = ActivityLog.objects.filter(
            target_type='task',
            target_id=str(task_pk)
        )[:50]
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)


class ProjectActivityViewSet(viewsets.ViewSet):
    """Get activity logs for a specific project."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, project_pk=None):
        logs = ActivityLog.objects.filter(
            target_type='project',
            target_id=str(project_pk)
        )[:50]
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)
