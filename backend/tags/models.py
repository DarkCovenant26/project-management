import uuid
from django.db import models
from django.conf import settings


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=30)  # HSL format, e.g., "hsl(210 100% 50%)"
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'owner']
        ordering = ['name']

    def __str__(self):
        return self.name


class TaskTag(models.Model):
    """Through model for Task-Tag M2M relationship."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        related_name='task_tags'
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name='tagged_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['task', 'tag']

    def __str__(self):
        return f"{self.task.title} - {self.tag.name}"
