from rest_framework import generics, permissions, pagination, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Project
from .member_models import ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from users.models import User

from core.utils import log_grc_event


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    pagination_class = pagination.PageNumberPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Include projects where user is owner OR a member
        owned = Project.objects.filter(owner=self.request.user)
        member_of = Project.objects.filter(members__user=self.request.user)
        return (owned | member_of).distinct()

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        # Auto-add creator as owner in ProjectMember
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role='owner',
            invited_by=self.request.user
        )
        log_grc_event(self.request.user, 'CREATE', 'PROJECT', project.id)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        owned = Project.objects.filter(owner=self.request.user)
        member_of = Project.objects.filter(members__user=self.request.user)
        return (owned | member_of).distinct()

    def perform_update(self, serializer):
        project = serializer.save()
        log_grc_event(self.request.user, 'UPDATE', 'PROJECT', project.id)

    def perform_destroy(self, instance):
        project_id = instance.id
        instance.delete()
        log_grc_event(self.request.user, 'DELETE', 'PROJECT', project_id)


class ProjectMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for managing project members with RBAC."""
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_pk')
        return ProjectMember.objects.filter(project_id=project_id).select_related('user', 'invited_by')

    def get_project(self):
        project_id = self.kwargs.get('project_pk')
        return get_object_or_404(Project, id=project_id)

    def check_member_permission(self, project, required_roles):
        """Check if current user has required role."""
        try:
            membership = ProjectMember.objects.get(project=project, user=self.request.user)
            return membership.role in required_roles
        except ProjectMember.DoesNotExist:
            return project.owner == self.request.user  # Owner always has access

    def create(self, request, *args, **kwargs):
        """Add a new member to the project."""
        project = self.get_project()
        
        if not self.check_member_permission(project, ['owner', 'admin']):
            return Response(
                {'error': 'Only owners and admins can add members'},
                status=status.HTTP_403_FORBIDDEN
            )

        email = request.data.get('email')
        role = request.data.get('role', 'member')

        if role not in ['admin', 'member', 'viewer']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if ProjectMember.objects.filter(project=project, user=user).exists():
            return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)

        member = ProjectMember.objects.create(
            project=project,
            user=user,
            role=role,
            invited_by=request.user
        )

        log_grc_event(request.user, 'ADD_MEMBER', 'PROJECT', project.id, extra={'member_id': str(member.id)})
        
        return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update member role."""
        project = self.get_project()
        
        if not self.check_member_permission(project, ['owner', 'admin']):
            return Response(
                {'error': 'Only owners and admins can update members'},
                status=status.HTTP_403_FORBIDDEN
            )

        member = self.get_object()
        
        # Cannot change owner role
        if member.role == 'owner':
            return Response({'error': 'Cannot modify owner role'}, status=status.HTTP_400_BAD_REQUEST)

        new_role = request.data.get('role')
        if new_role and new_role != 'owner':
            member.role = new_role
            member.save()
            log_grc_event(request.user, 'UPDATE_MEMBER', 'PROJECT', project.id, extra={'member_id': str(member.id)})

        return Response(ProjectMemberSerializer(member).data)

    def destroy(self, request, *args, **kwargs):
        """Remove a member from the project."""
        project = self.get_project()
        
        if not self.check_member_permission(project, ['owner', 'admin']):
            return Response(
                {'error': 'Only owners and admins can remove members'},
                status=status.HTTP_403_FORBIDDEN
            )

        member = self.get_object()
        
        # Cannot remove owner
        if member.role == 'owner':
            return Response({'error': 'Cannot remove project owner'}, status=status.HTTP_400_BAD_REQUEST)

        member_id = str(member.id)
        member.delete()
        log_grc_event(request.user, 'REMOVE_MEMBER', 'PROJECT', project.id, extra={'member_id': member_id})

        return Response(status=status.HTTP_204_NO_CONTENT)

