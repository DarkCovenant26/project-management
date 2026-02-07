from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    dashboard_preferences = models.JSONField(default=dict, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)  # Email, in-app settings
    app_preferences = models.JSONField(default=dict, blank=True)  # Theme, shortcuts, defaults

