from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
] + router.urls
