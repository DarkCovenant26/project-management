from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    board_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @staticmethod
    def get_default_board_settings():
        """Returns the default board column configuration."""
        return {
            "columns": [
                {"id": "backlog", "title": "Backlog", "status": "backlog", "visible": False},
                {"id": "in_progress", "title": "In Progress", "status": "in_progress", "visible": True},
                {"id": "review", "title": "Review", "status": "review", "visible": True},
                {"id": "done", "title": "Done", "status": "done", "visible": True},
            ]
        }
    
    def get_board_columns(self):
        """Returns the board columns, falling back to defaults if not set."""
        if self.board_settings and 'columns' in self.board_settings:
            return self.board_settings['columns']
        return self.get_default_board_settings()['columns']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
