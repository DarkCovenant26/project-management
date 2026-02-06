from rest_framework import viewsets, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['is_completed', 'priority', 'project']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'priority', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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
        # Convert to dict for easier consumption: {'High': 2, 'Medium': 5}
        tasks_by_priority = {item['priority']: item['count'] for item in priority_counts}
        
        # Ensure all priorities are present in the response even if count is 0
        for priority, _ in Task.PRIORITY_CHOICES:
            if priority not in tasks_by_priority:
                tasks_by_priority[priority] = 0

        data = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "tasks_by_priority": tasks_by_priority
        }
        return Response(data)
