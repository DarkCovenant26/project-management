from django.db.models import Count, Q, F
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Task
from projects.models import Project

from .analytics_serializers import (
    TaskDistributionSerializer, 
    ProjectPerformanceSerializer, 
    ProductivityTrendSerializer
)

class TaskDistributionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(owner=request.user)
        
        status_dist = list(tasks.values('status').annotate(count=Count('id')).order_by('-count'))
        priority_dist = list(tasks.values('priority').annotate(count=Count('id')).order_by('-count'))

        serializer = TaskDistributionSerializer(data={
            "status": status_dist,
            "priority": priority_dist
        })
        serializer.is_valid()
        return Response(serializer.data)

class ProjectPerformanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(owner=request.user).annotate(
            total_tasks=Count('tasks'),
            completed_tasks=Count('tasks', filter=Q(tasks__is_completed=True)),
            pending_tasks=Count('tasks', filter=Q(tasks__is_completed=False))
        )

        data = []
        for p in projects:
            completion_rate = (p.completed_tasks / p.total_tasks * 100) if p.total_tasks > 0 else 0
            data.append({
                "id": p.id,
                "title": p.name,
                "total_tasks": p.total_tasks,
                "completed_tasks": p.completed_tasks,
                "pending_tasks": p.pending_tasks,
                "completion_rate": round(completion_rate, 1)
            })

        serializer = ProjectPerformanceSerializer(data, many=True)
        return Response(serializer.data)

class ProductivityTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import datetime
        last_7_days = datetime.date.today() - datetime.timedelta(days=7)
        
        trend = list(Task.objects.filter(
            owner=request.user,
            is_completed=True,
            updated_at__date__gte=last_7_days
        ).annotate(
            date=TruncDate('updated_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date'))

        serializer = ProductivityTrendSerializer(trend, many=True)
        return Response(serializer.data)
