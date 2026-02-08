from rest_framework import generics, permissions, pagination, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from pydantic import ValidationError

from .models import Project
from .member_models import ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .schemas import ProjectCreateSchema, ProjectUpdateSchema, MemberAddSchema, MemberUpdateSchema
from users.models import User

from activity.signals import log_activity
from core.permissions import CanManageProject


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    pagination_class = pagination.PageNumberPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Include projects where user is owner OR a member
        owned = Project.objects.filter(owner=self.request.user)
        member_of = Project.objects.filter(members__user=self.request.user)
        return (owned | member_of).distinct()

    def create(self, request, *args, **kwargs):
        # Pydantic validation
        try:
            validated = ProjectCreateSchema(**request.data)
            request._full_data = validated.model_dump(exclude_unset=True, by_alias=False)
        except ValidationError as e:
            errors = {err['loc'][0]: err['msg'] for err in e.errors()}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        # Auto-add creator as owner in ProjectMember
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role='owner',
            invited_by=self.request.user
        )
        log_activity(self.request.user, 'created', 'project', project.id, project.name)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageProject]

    def get_queryset(self):
        owned = Project.objects.filter(owner=self.request.user)
        member_of = Project.objects.filter(members__user=self.request.user)
        return (owned | member_of).distinct()

    def update(self, request, *args, **kwargs):
        # Pydantic validation
        try:
            validated = ProjectUpdateSchema(**request.data)
            request._full_data = validated.model_dump(exclude_unset=True, by_alias=False)
        except ValidationError as e:
            errors = {err['loc'][0]: err['msg'] for err in e.errors()}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        project = serializer.save()
        log_activity(self.request.user, 'updated', 'project', project.id, project.name)

    def perform_destroy(self, instance):
        project_id = instance.id
        instance.delete()
        log_activity(self.request.user, 'deleted', 'project', project_id, project.name)


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

        # Pydantic validation
        try:
            validated = MemberAddSchema(**request.data)
        except ValidationError as e:
            errors = {err['loc'][0]: err['msg'] for err in e.errors()}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = validated.email
        role = validated.role

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

        log_activity(request.user, 'assigned', 'project', project.id, project.name, description=f"Added user '{user.username}' as {role}")
        
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

        # Pydantic validation
        try:
            validated = MemberUpdateSchema(**request.data)
        except ValidationError as e:
            errors = {err['loc'][0]: err['msg'] for err in e.errors()}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_role = validated.role
        if new_role != 'owner':
            member.role = new_role
            member.save()
            log_activity(request.user, 'assigned', 'project', project.id, project.name, description=f"Updated user '{member.user.username}' role to {new_role}")

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
        log_activity(request.user, 'removed', 'project', project.id, project.name, description=f"Removed user '{member.user.username}' from project")

        return Response(status=status.HTTP_204_NO_CONTENT)

