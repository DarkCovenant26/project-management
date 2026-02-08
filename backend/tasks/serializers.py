from rest_framework import serializers
from .models import Task, Subtask

from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class SubtaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(min_length=1, max_length=200)

    class Meta:
        model = Subtask
        fields = ['id', 'title', 'is_completed', 'order', 'created_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'completed_at']


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(min_length=1, max_length=200)
    description = serializers.CharField(max_length=2000, allow_blank=True, required=False)
    priority = serializers.ChoiceField(choices=['Low', 'Medium', 'High', 'Critical'])
    status = serializers.ChoiceField(choices=['backlog', 'todo', 'in_progress', 'review', 'done'], required=False)
    task_type = serializers.ChoiceField(choices=['Feature', 'Bug', 'Chore', 'Improvement', 'Story'], required=False)
    
    startDate = serializers.DateTimeField(source='start_date', required=False, allow_null=True)
    dueDate = serializers.DateTimeField(source='due_date', required=False, allow_null=True)
    actualCompletionDate = serializers.DateTimeField(source='actual_completion_date', required=False, allow_null=True)

    # Agile Metrics
    storyPoints = serializers.IntegerField(source='story_points', required=False, min_value=0)
    timeEstimate = serializers.DecimalField(source='time_estimate', required=False, max_digits=5, decimal_places=2, allow_null=True)
    timeSpent = serializers.DecimalField(source='time_spent', required=False, max_digits=5, decimal_places=2, allow_null=True)

    # Subtask stats (read-only computed fields)
    subtask_count = serializers.SerializerMethodField()
    subtask_completed = serializers.SerializerMethodField()
    subtask_progress = serializers.SerializerMethodField()
    
    # Tags (read-only)
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True, required=False)
    
    # Relations
    assignee_ids = serializers.ListField(child=serializers.PrimaryKeyRelatedField(queryset=User.objects.all()), write_only=True, required=False)
    blocked_by_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True, required=False)
    
    assignees = serializers.SerializerMethodField()
    blocked_by = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'is_completed', 'priority', 'status', 'task_type',
            'startDate', 'dueDate', 'actualCompletionDate', 
            'storyPoints', 'timeEstimate', 'timeSpent',
            'project', 'owner', 'assignees', 'blocked_by',
            'created_at', 'updated_at', 
            'subtask_count', 'subtask_completed', 'subtask_progress', 'tags', 
            'tag_ids', 'assignee_ids', 'blocked_by_ids'
        )
        read_only_fields = ('owner', 'created_at', 'updated_at', 'deleted_at')

    def get_subtask_count(self, obj):
        return obj.subtasks.count()

    def get_subtask_completed(self, obj):
        return obj.subtasks.filter(is_completed=True).count()

    def get_subtask_progress(self, obj):
        total = obj.subtasks.count()
        if total == 0:
            return 0.0
        completed = obj.subtasks.filter(is_completed=True).count()
        return round(completed / total, 2)

    def get_tags(self, obj):
        from tags.serializers import TagSerializer
        tags = [tt.tag for tt in obj.task_tags.select_related('tag').all()]
        return TagSerializer(tags, many=True).data

    def get_assignees(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.assignees.all(), many=True).data
    
    def get_blocked_by(self, obj):
        return TaskSerializer(obj.blocked_by.all(), many=True, context=self.context).data

    def validate_due_date(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        assignee_ids = validated_data.pop('assignee_ids', [])
        blocked_by_ids = validated_data.pop('blocked_by_ids', [])
        
        validated_data['owner'] = self.context['request'].user
        task = super().create(validated_data)
        
        # Tags
        if tag_ids:
            from tags.models import Tag, TaskTag
            tags = Tag.objects.filter(id__in=tag_ids, owner=self.context['request'].user)
            TaskTag.objects.bulk_create([TaskTag(task=task, tag=tag) for tag in tags])
            
        # Assignees
        if assignee_ids:
            task.assignees.set(assignee_ids)
            
        # Dependencies
        if blocked_by_ids:
            blockers = Task.objects.filter(id__in=blocked_by_ids)
            task.blocked_by.set(blockers)
            
        return task

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        assignee_ids = validated_data.pop('assignee_ids', None)
        blocked_by_ids = validated_data.pop('blocked_by_ids', None)
        
        task = super().update(instance, validated_data)
        
        # Tags Logic (Simplified for brevity, full diff logic in previous version)
        if tag_ids is not None:
            from tags.models import Tag, TaskTag
            current_tag_ids = set(instance.task_tags.values_list('tag_id', flat=True))
            new_tag_ids_verified = set(Tag.objects.filter(id__in=tag_ids).values_list('id', flat=True))
            
            to_add = new_tag_ids_verified - current_tag_ids
            to_remove = current_tag_ids - new_tag_ids_verified
            
            if to_remove:
                TaskTag.objects.filter(task=task, tag_id__in=to_remove).delete()
            if to_add:
                TaskTag.objects.bulk_create([TaskTag(task=task, tag_id=tid) for tid in to_add])

        # Assignees
        if assignee_ids is not None:
            task.assignees.set(assignee_ids)
            
        # Dependencies
        if blocked_by_ids is not None:
            blockers = Task.objects.filter(id__in=blocked_by_ids)
            task.blocked_by.set(blockers)
            
        return task


class BulkActionSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=50
    )
    action = serializers.ChoiceField(choices=[
        'complete', 'delete', 'move', 'set_priority', 'set_status'
    ])
    value = serializers.CharField(required=False, allow_null=True, allow_blank=True)
