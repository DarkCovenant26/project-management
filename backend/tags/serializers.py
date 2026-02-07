from rest_framework import serializers
from .models import Tag, TaskTag


class TagSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=1, max_length=50)
    color = serializers.CharField(max_length=30)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_color(self, value):
        # Basic HSL validation
        if not value.startswith('hsl('):
            raise serializers.ValidationError("Color must be in HSL format, e.g., 'hsl(210 100% 50%)'")
        return value


class TaskTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    tag_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = TaskTag
        fields = ['id', 'tag', 'tag_id', 'created_at']
        read_only_fields = ['id', 'created_at']
