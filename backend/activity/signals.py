from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import ActivityLog


def log_activity(actor, action, target_type, target_id, target_title, delta=None, description=None):
    """
    Helper function to create activity log entries.
    Called from views/signals to maintain audit trail.
    """
    if description is None:
        description = f"{target_type.capitalize()} '{target_title}' was {action}"
    
    ActivityLog.objects.create(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        target_title=target_title,
        delta=delta,
        description=description
    )
