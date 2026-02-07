from rest_framework import serializers
from .models import Task, Subtask

from django.utils import timezone


class SubtaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(min_length=1, max_length=200)

    class Meta:
        model = Subtask
        fields = ['id', 'title', 'is_completed', 'order', 'created_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'completed_at']


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(min_length=1, max_length=200)
    description = serializers.CharField(max_length=2000, allow_blank=True, required=False)
    priority = serializers.ChoiceField(choices=['Low', 'Medium', 'High'])
    status = serializers.ChoiceField(choices=['backlog', 'in_progress', 'review', 'done'], required=False)
    
    startDate = serializers.DateTimeField(source='start_date', required=False, allow_null=True)
    dueDate = serializers.DateTimeField(source='due_date', required=False, allow_null=True)

    # Subtask stats (read-only computed fields)
    subtask_count = serializers.SerializerMethodField()
    subtask_completed = serializers.SerializerMethodField()
    subtask_progress = serializers.SerializerMethodField()
    
    # Tags (read-only)
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'is_completed', 'priority', 'status', 
            'startDate', 'dueDate', 'project', 'owner', 'created_at', 'updated_at', 
            'subtask_count', 'subtask_completed', 'subtask_progress', 'tags', 'tag_ids'
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

    def validate_due_date(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        validated_data['owner'] = self.context['request'].user
        task = super().create(validated_data)
        
        if tag_ids:
            from tags.models import Tag, TaskTag
            tags = Tag.objects.filter(id__in=tag_ids, owner=self.context['request'].user)
            TaskTag.objects.bulk_create([
                TaskTag(task=task, tag=tag) for tag in tags
            ])
            # Log activity for tagging
            from activity.signals import log_activity
            for tag in tags:
                log_activity(self.context['request'].user, 'tagged', 'task', task.id, task.title, description=f"Tagged task '{task.title}' with '{tag.name}'")
            
        return task

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        task = super().update(instance, validated_data)
        
        if tag_ids is not None:
            from tags.models import Tag, TaskTag
            
            # Get current tags
            current_tag_ids = set(instance.task_tags.values_list('tag_id', flat=True))
            new_tag_ids = set(str(t_id) for t_id in tag_ids) # Ensure string comparison if UUID
            
            # Convert UUIDs to string for set logic if needed, but Django handles UUID comparison
            # Let's fetch objects to be safe and use IDs
            
            new_tags = list(Tag.objects.filter(id__in=tag_ids, owner=self.context['request'].user))
            new_tag_ids_verified = set(t.id for t in new_tags)
            
            # Calculate diff
            to_add = new_tag_ids_verified - current_tag_ids
            to_remove = current_tag_ids - new_tag_ids_verified
            
            # Remove
            if to_remove:
                TaskTag.objects.filter(task=task, tag_id__in=to_remove).delete()
                # Log activity? Maybe bulk or individual
            
            # Add
            if to_add:
                tags_to_add = [t for t in new_tags if t.id in to_add]
                TaskTag.objects.bulk_create([
                    TaskTag(task=task, tag=tag) for tag in tags_to_add
                ])
                
            # Log activity (simplified for now to avoid spamming)
            if to_add or to_remove:
                from activity.signals import log_activity
                log_activity(
                    self.context['request'].user, 
                    'updated', 
                    'task', 
                    task.id, 
                    task.title, 
                    delta={'tags_added': [str(t) for t in to_add], 'tags_removed': [str(t) for t in to_remove]},
                    description=f"Updated tags for task '{task.title}'"
                )
            
        return task


class BulkActionSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=50
    )
    action = serializers.ChoiceField(choices=[
        'complete', 'delete', 'move', 'set_priority', 'set_status'
    ])
    value = serializers.CharField(required=False, allow_null=True, allow_blank=True)
