from rest_framework import serializers

class TaskDistributionSerializer(serializers.Serializer):
    status = serializers.ListField(child=serializers.DictField())
    priority = serializers.ListField(child=serializers.DictField())

class ProjectPerformanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()

class ProductivityTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    count = serializers.IntegerField()
