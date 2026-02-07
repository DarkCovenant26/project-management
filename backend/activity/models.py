import uuid
from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('completed', 'Completed'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('tagged', 'Tagged'),
        ('untagged', 'Untagged'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_type = models.CharField(max_length=50)  # 'task', 'project', 'subtask', 'tag'
    target_id = models.CharField(max_length=50)  # UUID or int as string
    target_title = models.CharField(max_length=200)  # Snapshot for deleted items
    delta = models.JSONField(null=True, blank=True)  # What changed
    description = models.TextField()  # Human-readable
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['actor', '-created_at']),
        ]

    def __str__(self):
        return f"{self.actor} {self.action} {self.target_type} '{self.target_title}'"
