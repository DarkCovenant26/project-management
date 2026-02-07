from django.db import models
from django.conf import settings
from tasks.models import Task

class QuickNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quick_notes')
    content = models.TextField()
    is_archived = models.BooleanField(default=False)
    converted_task = models.OneToOneField(Task, null=True, blank=True, on_delete=models.SET_NULL, related_name='original_note')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.user.username}: {self.content[:50]}..."
