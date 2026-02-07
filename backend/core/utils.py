import logging

logger = logging.getLogger('grc_audit')

def log_grc_event(user, action, resource_type, resource_id, details=None):
    """
    GRC Logging: Every 'Write' operation must trigger a background event 
    for the 'Nervous System' audit trail.
    """
    event_data = {
        'user_id': str(user.id) if user else 'system',
        'user_email': user.email if user else 'system',
        'action': action,
        'resource_type': resource_type,
        'resource_id': str(resource_id),
        'details': details or {}
    }
    # In a real system, this would go to a database table or a dedicated logging service (SIEM)
    # For now, we'll log it to a specific logger which can be configured to write to a file or stdout.
    logger.info(f"GRC EVENT: {event_data}")
