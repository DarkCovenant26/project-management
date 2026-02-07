from rest_framework import generics, permissions
from .models import Project
from .serializers import ProjectSerializer

from core.utils import log_grc_event

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        log_grc_event(self.request.user, 'CREATE', 'PROJECT', project.id)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        project = serializer.save()
        log_grc_event(self.request.user, 'UPDATE', 'PROJECT', project.id)

    def perform_destroy(self, instance):
        project_id = instance.id
        # CASCADE is handled by the model on_delete=models.CASCADE
        instance.delete()
        log_grc_event(self.request.user, 'DELETE', 'PROJECT', project_id)
