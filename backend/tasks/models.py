import uuid
from django.db import models
from django.conf import settings
from projects.models import Project

from django.utils import timezone

class TaskQuerySet(models.QuerySet):
    def active(self):
        return self.filter(deleted_at__isnull=True)

class TaskManager(models.Manager):
    def get_queryset(self):
        return TaskQuerySet(self.model, using=self._db).active()

    def all_with_deleted(self):
        return TaskQuerySet(self.model, using=self._db)

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('done', 'Done'),
    ]

    TASK_TYPE_CHOICES = [
        ('Feature', 'Feature'),
        ('Bug', 'Bug'),
        ('Chore', 'Chore'),
        ('Improvement', 'Improvement'),
        ('Story', 'Story'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='backlog')
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES, default='Feature')
    
    # Agile Metrics
    story_points = models.PositiveIntegerField(default=0, help_text="Agile estimation points")
    time_estimate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Estimated hours")
    time_spent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Actual hours spent")
    
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    actual_completion_date = models.DateTimeField(null=True, blank=True)
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_tasks')
    assignees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_tasks', blank=True)
    
    # Dependencies
    blocked_by = models.ManyToManyField('self', symmetrical=False, related_name='blocking', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = TaskManager()

    class Meta:
        ordering = ['-created_at']

    def delete(self, **kwargs):
        self.deleted_at = timezone.now()
        self.save()

    def __str__(self):
        return self.title


class Subtask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    parent_task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='subtasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.is_completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
