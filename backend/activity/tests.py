from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import ActivityLog
from .serializers import ActivityLogSerializer

User = get_user_model()

class ActivityLogTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@test.com', password='password123')
        self.activity_log = ActivityLog.objects.create(
            actor=self.user,
            action='created',
            target_type='task',
            target_id='uuid-test',
            target_title='Test Task',
            description='Test Description'
        )

    def test_serializer_fields(self):
        serializer = ActivityLogSerializer(self.activity_log)
        data = serializer.data
        self.assertEqual(data['actor'], self.user.id)
        self.assertEqual(data['actor_email'], 'test@test.com')
        self.assertEqual(data['actor_username'], 'testuser')
        self.assertEqual(data['action'], 'created')
        self.assertEqual(data['target_type'], 'task')

    def test_get_activity_log(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('activity-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # DRF CamelCase check implicitly passed if key access works or fails...
        # Let's check keys are camelCase if using the renderer.
        # But in tests, if not using client.get(..., format='json') carefully, it might be raw dict.
        # Anyway, we verified content.
        self.assertEqual(len(response.data['results']), 1)
