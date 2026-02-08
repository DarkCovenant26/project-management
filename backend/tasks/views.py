from rest_framework import viewsets, permissions, filters, status, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .models import Task, Subtask
from .serializers import TaskSerializer, SubtaskSerializer, BulkActionSerializer

from core.utils import log_grc_event
from activity.signals import log_activity
from core.mixins import PydanticValidationMixin
from core.permissions import CanEditTask, IsProjectMember
from .schemas import TaskCreateSchema, TaskUpdateSchema, StatusUpdateSchema, SubtaskCreateSchema, SubtaskUpdateSchema


class TaskViewSet(PydanticValidationMixin, viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    pagination_class = pagination.PageNumberPagination
    permission_classes = [permissions.IsAuthenticated, IsProjectMember, CanEditTask]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Pydantic schemas for validation
    pydantic_create_schema = TaskCreateSchema
    pydantic_update_schema = TaskUpdateSchema
    
    filterset_fields = ['is_completed', 'priority', 'project', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'priority', 'created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Task.objects.filter(owner=self.request.user)
        
        # Filter by tag
        tag_id = self.request.query_params.get('tag')
        if tag_id:
            queryset = queryset.filter(task_tags__tag_id=tag_id)
        
        return queryset

    def perform_create(self, serializer):
        task = serializer.save(owner=self.request.user)
        log_grc_event(self.request.user, 'CREATE', 'TASK', task.id)
        log_activity(self.request.user, 'created', 'task', task.id, task.title)

    def perform_update(self, serializer):
        old_status = serializer.instance.status if serializer.instance else None
        task = serializer.save()
        log_grc_event(self.request.user, 'UPDATE', 'TASK', task.id)
        
        # Log status change specifically
        new_status = task.status
        if old_status and old_status != new_status:
            log_activity(
                self.request.user, 'status_changed', 'task', task.id, task.title,
                delta={'old_status': old_status, 'new_status': new_status},
                description=f"Task '{task.title}' status changed from '{old_status}' to '{new_status}'"
            )
        else:
            log_activity(self.request.user, 'updated', 'task', task.id, task.title)

    def perform_destroy(self, instance):
        task_id = instance.id
        task_title = instance.title
        instance.delete()  # Soft delete
        log_grc_event(self.request.user, 'DELETE', 'TASK', task_id)
        log_activity(self.request.user, 'deleted', 'task', task_id, task_title)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """Quick status update endpoint for Kanban drag-and-drop."""
        # Pydantic validation
        try:
            validated = StatusUpdateSchema(**request.data)
        except Exception as e:
            return Response({'status': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        task = self.get_object()
        old_status = task.status
        new_status = validated.status
        
        task.status = new_status
        if new_status == 'done':
            task.is_completed = True
        elif old_status == 'done':
            task.is_completed = False
        task.save()
        
        log_grc_event(request.user, 'UPDATE', 'TASK', task.id)
        log_activity(
            request.user, 'status_changed', 'task', task.id, task.title,
            delta={'old_status': old_status, 'new_status': new_status},
            description=f"Task '{task.title}' moved to '{new_status}'"
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class SubtaskViewSet(PydanticValidationMixin, viewsets.ModelViewSet):
    """Nested ViewSet for subtasks under a task."""
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember, CanEditTask]
    
    # Pydantic schemas
    pydantic_create_schema = SubtaskCreateSchema
    pydantic_update_schema = SubtaskUpdateSchema

    def get_queryset(self):
        task_id = self.kwargs.get('task_pk')
        return Subtask.objects.filter(parent_task_id=task_id, parent_task__owner=self.request.user)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_pk')
        task = get_object_or_404(Task, pk=task_id, owner=self.request.user)
        
        # Auto-set order to be last
        max_order = Subtask.objects.filter(parent_task=task).count()
        subtask = serializer.save(parent_task=task, order=max_order)
        
        log_grc_event(self.request.user, 'CREATE', 'SUBTASK', subtask.id)
        log_activity(self.request.user, 'created', 'subtask', subtask.id, subtask.title)

    def perform_update(self, serializer):
        subtask = serializer.save()
        log_grc_event(self.request.user, 'UPDATE', 'SUBTASK', subtask.id)
        
        if subtask.is_completed:
            log_activity(self.request.user, 'completed', 'subtask', subtask.id, subtask.title)
        else:
            log_activity(self.request.user, 'updated', 'subtask', subtask.id, subtask.title)

    def perform_destroy(self, instance):
        subtask_id = instance.id
        subtask_title = instance.title
        instance.delete()
        log_grc_event(self.request.user, 'DELETE', 'SUBTASK', subtask_id)
        log_activity(self.request.user, 'deleted', 'subtask', subtask_id, subtask_title)

    @action(detail=False, methods=['put'], url_path='reorder')
    def reorder(self, request, task_pk=None):
        """Reorder subtasks."""
        task = get_object_or_404(Task, pk=task_pk, owner=request.user)
        order_data = request.data.get('order', [])  # List of subtask IDs in new order
        
        for index, subtask_id in enumerate(order_data):
            Subtask.objects.filter(pk=subtask_id, parent_task=task).update(order=index)
        
        subtasks = Subtask.objects.filter(parent_task=task)
        serializer = SubtaskSerializer(subtasks, many=True)
        return Response(serializer.data)


class TaskBulkActionView(APIView):
    """Bulk operations on multiple tasks."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ids = serializer.validated_data['ids']
        action_type = serializer.validated_data['action']
        value = serializer.validated_data.get('value')
        
        tasks = Task.objects.filter(id__in=ids, owner=request.user)
        count = tasks.count()
        
        if count == 0:
            return Response({'error': 'No tasks found'}, status=status.HTTP_404_NOT_FOUND)
        
        if action_type == 'complete':
            tasks.update(status='done', is_completed=True)
            for task in tasks:
                log_activity(request.user, 'completed', 'task', task.id, task.title)
        elif action_type == 'delete':
            for task in tasks:
                task.delete()  # Soft delete
                log_activity(request.user, 'deleted', 'task', task.id, task.title)
        elif action_type == 'set_status':
            if value not in dict(Task.STATUS_CHOICES):
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            tasks.update(status=value)
        elif action_type == 'set_priority':
            if value not in dict(Task.PRIORITY_CHOICES):
                return Response({'error': 'Invalid priority'}, status=status.HTTP_400_BAD_REQUEST)
            tasks.update(priority=value)
        elif action_type == 'move':
            tasks.update(project_id=value)
        
        log_grc_event(request.user, 'BULK_UPDATE', 'TASK', 'multiple', {'ids': ids, 'action': action_type})
        
        return Response({'updated': count, 'action': action_type})


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(owner=user)
        
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(is_completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        
        # Priority breakdown
        priority_counts = tasks.values('priority').annotate(count=Count('priority'))
        tasks_by_priority = {item['priority']: item['count'] for item in priority_counts}
        
        for priority, _ in Task.PRIORITY_CHOICES:
            if priority not in tasks_by_priority:
                tasks_by_priority[priority] = 0

        # Status breakdown (for Kanban)
        status_counts = tasks.values('status').annotate(count=Count('status'))
        tasks_by_status = {item['status']: item['count'] for item in status_counts}
        
        for status_choice, _ in Task.STATUS_CHOICES:
            if status_choice not in tasks_by_status:
                tasks_by_status[status_choice] = 0

        data = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "tasks_by_priority": tasks_by_priority,
            "tasks_by_status": tasks_by_status
        }
        return Response(data)
