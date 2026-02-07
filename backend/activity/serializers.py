from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)
    actor_username = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'actor', 'actor_username', 'actor_email', 'action', 'target_type',
            'target_id', 'target_title', 'delta', 'description', 'created_at'
        ]
        read_only_fields = fields  # All fields are read-only (immutable logs)
