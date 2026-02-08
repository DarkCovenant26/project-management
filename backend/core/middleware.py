
"""
Middleware for global request logging and audit trails.
Implements the "Nervous System" - tracking every write operation.
"""
import logging
import json
import time
from django.utils.deprecation import MiddlewareMixin
from core.utils import log_grc_event

logger = logging.getLogger('audit')

class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware to log all state-changing requests (POST, PUT, PATCH, DELETE).
    """
    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        # Only log state-changing methods or errors
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] or response.status_code >= 400:
            if hasattr(request, 'user') and request.user.is_authenticated:
                duration = time.time() - getattr(request, 'start_time', time.time())
                
                # Extract resource details if available
                resource_type = 'UNKNOWN'
                resource_id = 'N/A'
                
                # Heuristic to guess resource from URL
                path_parts = request.path.strip('/').split('/')
                if len(path_parts) >= 2:
                    resource_type = path_parts[-2].upper()
                    resource_id = path_parts[-1]
                elif len(path_parts) == 1:
                    resource_type = path_parts[0].upper()

                log_data = {
                    'user': request.user.username,
                    'method': request.method,
                    'path': request.path,
                    'status': response.status_code,
                    'duration': f"{duration:.3f}s",
                    'ip': self.get_client_ip(request),
                    'resource_type': resource_type,
                    'resource_id': resource_id
                }
                
                logger.info(f"AUDIT_EVENT: {json.dumps(log_data)}")
                
                # Trigger GRC event for critical actions automatically if not handled by view
                if response.status_code < 400 and request.method != 'GET':
                    # We accept that views might also log meaningful events.
                    # This is a catch-all "Nervous System" pulse.
                    pass 

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
