from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import TaskViewSet, SubtaskViewSet, TaskBulkActionView, DashboardStatsView
from tags.views import TaskTagViewSet
from activity.views import TaskActivityViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

# Nested routers for subtasks and tags under tasks
tasks_router = nested_routers.NestedDefaultRouter(router, r'', lookup='task')
tasks_router.register(r'subtasks', SubtaskViewSet, basename='task-subtasks')
tasks_router.register(r'tags', TaskTagViewSet, basename='task-tags')
tasks_router.register(r'activity', TaskActivityViewSet, basename='task-activity')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('bulk/', TaskBulkActionView.as_view(), name='task-bulk'),
] + router.urls + tasks_router.urls
