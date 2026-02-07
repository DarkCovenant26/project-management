from rest_framework import serializers
from .models import Project
from .member_models import ProjectMember


class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer for project membership with RBAC."""
    userId = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    invitedAt = serializers.DateTimeField(source='invited_at', read_only=True)
    invitedById = serializers.IntegerField(source='invited_by.id', read_only=True, allow_null=True)
    
    class Meta:
        model = ProjectMember
        fields = ('id', 'userId', 'username', 'email', 'role', 'invitedAt', 'invitedById', 'accepted')
        read_only_fields = ('id', 'userId', 'username', 'email', 'invitedAt', 'invitedById')

    def validate_role(self, value):
        if value not in ['owner', 'admin', 'member', 'viewer']:
            raise serializers.ValidationError("Invalid role")
        return value


class ProjectSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    description = serializers.CharField(max_length=1000, allow_blank=True, required=False)
    boardSettings = serializers.JSONField(source='board_settings', required=False)
    boardColumns = serializers.SerializerMethodField()
    members = ProjectMemberSerializer(many=True, read_only=True)
    memberCount = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'createdAt', 'updatedAt', 'owner', 'boardSettings', 'boardColumns', 'members', 'memberCount')
        read_only_fields = ('owner', 'createdAt', 'updatedAt', 'boardColumns', 'members', 'memberCount')
    
    def get_boardColumns(self, obj):
        """Returns board columns with defaults if not configured."""
        return obj.get_board_columns()
    
    def get_memberCount(self, obj):
        return obj.members.count()

