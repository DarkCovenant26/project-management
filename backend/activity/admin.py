from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['actor', 'action', 'target_type', 'target_title', 'created_at']
    list_filter = ['action', 'target_type', 'created_at']
    search_fields = ['target_title', 'description']
    readonly_fields = ['id', 'actor', 'action', 'target_type', 'target_id', 'target_title', 'delta', 'description', 'created_at']
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Logs are immutable
    
    def has_delete_permission(self, request, obj=None):
        return False  # GRC: Logs cannot be deleted
