from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class ProjectMember(models.Model):
    """
    Represents membership of a user in a project with role-based permissions.
    Supports RBAC: Owner, Admin, Member, Viewer
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_invitations'
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=True)  # Auto-accept for now
    
    class Meta:
        unique_together = ['project', 'user']
        ordering = ['role', 'invited_at']

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role})"

    @property
    def can_manage_members(self):
        return self.role in ['owner', 'admin']

    @property
    def can_edit_project(self):
        return self.role in ['owner', 'admin']

    @property
    def can_edit_tasks(self):
        return self.role in ['owner', 'admin', 'member']

    @property
    def can_configure_board(self):
        return self.role in ['owner', 'admin']
