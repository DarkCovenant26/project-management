from django.contrib import admin
from .models import Tag, TaskTag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'owner', 'created_at']
    list_filter = ['owner']
    search_fields = ['name']


@admin.register(TaskTag)
class TaskTagAdmin(admin.ModelAdmin):
    list_display = ['task', 'tag', 'created_at']
    list_filter = ['tag']
