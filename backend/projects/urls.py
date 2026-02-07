from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, ProjectMemberViewSet

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    
    # Member management endpoints
    path('<int:project_pk>/members/', ProjectMemberViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='project-members-list'),
    path('<int:project_pk>/members/<uuid:pk>/', ProjectMemberViewSet.as_view({
        'get': 'retrieve',
        'patch': 'update',
        'delete': 'destroy'
    }), name='project-member-detail'),
]

