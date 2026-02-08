"""
RBAC Permission utilities.
Provides role-based access control checks for project resources.
"""
from rest_framework import permissions
from projects.member_models import ProjectMember


class IsProjectMember(permissions.BasePermission):
    """
    Permission that checks if the user is a member of the task's project.
    """
    def has_object_permission(self, request, view, obj):
        # For Tasks, check membership in the parent project
        project = getattr(obj, 'project', None)
        if project is None:
            return True  # No project = personal task, allow
        
        return ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).exists() or project.owner == request.user


class CanEditTask(permissions.BasePermission):
    """
    Permission that checks if the user can edit tasks in the project.
    Roles: owner, admin, member
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True  # Read is allowed for all members
        
        project = getattr(obj, 'project', None)
        if project is None:
            return obj.owner == request.user  # Personal task
        
        try:
            membership = ProjectMember.objects.get(
                project=project,
                user=request.user
            )
            return membership.can_edit_tasks
        except ProjectMember.DoesNotExist:
            return project.owner == request.user


class CanManageProject(permissions.BasePermission):
    """
    Permission for project settings, column config, member management.
    Roles: owner, admin
    """
    def has_object_permission(self, request, view, obj):
        project = obj if hasattr(obj, 'members') else getattr(obj, 'project', None)
        if project is None:
            return False
        
        if project.owner == request.user:
            return True
        
        try:
            membership = ProjectMember.objects.get(
                project=project,
                user=request.user
            )
            return membership.can_manage_members
        except ProjectMember.DoesNotExist:
            return False


class IsViewerOrAbove(permissions.BasePermission):
    """
    Minimum permission: viewer role or higher.
    """
    def has_object_permission(self, request, view, obj):
        project = getattr(obj, 'project', None)
        if project is None:
            return obj.owner == request.user
        
        return ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).exists() or project.owner == request.user


def get_user_role(user, project):
    """
    Utility to get user's role in a project.
    Returns None if not a member.
    """
    if project.owner == user:
        return 'owner'
    
    try:
        membership = ProjectMember.objects.get(project=project, user=user)
        return membership.role
    except ProjectMember.DoesNotExist:
        return None


def user_can_edit_tasks(user, project):
    """Check if user can create/edit tasks in project."""
    role = get_user_role(user, project)
    return role in ['owner', 'admin', 'member']


def user_can_manage_project(user, project):
    """Check if user can manage project settings and members."""
    role = get_user_role(user, project)
    return role in ['owner', 'admin']
