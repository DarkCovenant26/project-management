
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import ActivityLog
from tasks.models import Task
from projects.models import Project

def log_activity(actor, action, target_type, target_id, target_title, delta=None, description=None):
    """
    Helper function to create activity log entries.
    Called from views/signals to maintain audit trail.
    """
    if not actor or not actor.is_authenticated:
        return

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

@receiver(post_save, sender=Task)
def task_activity(sender, instance, created, **kwargs):
    # Skip if no user available (e.g. script), handle in view if possible
    # But for signals, we often don't have the user request context easily without middleware thread locals.
    # For now, we rely on Views to call log_activity with the user.
    # Signals are a backup or for system events.
    pass

# Note: Django signals don't have access to 'request.user' by default.
# We will rely on the `AuditLogMiddleware` for generic "Write" logging 
# and the Views for specific "Business Logic" logging (like "Moved Task to Done").
# The signals here are placeholders if we introduce a middleware to capture current user in thread locals.

