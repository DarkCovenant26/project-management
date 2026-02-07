from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from tags.models import Tag, TaskTag
from tasks.models import Task

User = get_user_model()

class TaskTagIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.tag1 = Tag.objects.create(name='T1', color='hsl(0 0% 0%)', owner=self.user)
        self.tag2 = Tag.objects.create(name='T2', color='hsl(0 0% 0%)', owner=self.user)
        self.list_url = reverse('task-list')

    def test_create_task_with_tags(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Tagged Task',
            'priority': 'Medium',
            'tag_ids': [str(self.tag1.id), str(self.tag2.id)]
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        task_id = response.data['id']
        task = Task.objects.get(id=task_id)
        self.assertEqual(task.task_tags.count(), 2)
        
        # Verify response structure (tags field should be list of tag objects)
        self.assertEqual(len(response.data['tags']), 2)
        tag_names = [t['name'] for t in response.data['tags']]
        self.assertIn('T1', tag_names)
        self.assertIn('T2', tag_names)

    def test_update_task_tags(self):
        self.client.force_authenticate(user=self.user)
        # Create task without tags
        task = Task.objects.create(title='Update Tags', owner=self.user)
        
        url = reverse('task-detail', args=[task.id])
        data = {'tag_ids': [str(self.tag1.id)]}
        
        # Update to add T1
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.task_tags.count(), 1)
        self.assertEqual(task.task_tags.first().tag, self.tag1)
        
        # Update to replace T1 with T2
        data = {'tag_ids': [str(self.tag2.id)]}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.task_tags.count(), 1)
        self.assertEqual(task.task_tags.first().tag, self.tag2)
        
        # Update to clear tags
        data = {'tag_ids': []}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.task_tags.count(), 0)

    def test_invalid_tags(self):
        self.client.force_authenticate(user=self.user)
        # Random UUID
        import uuid
        random_id = str(uuid.uuid4())
        data = {
            'title': 'Invalid Tag Task',
            'priority': 'Medium',
            'tag_ids': [random_id]
        }
        response = self.client.post(self.list_url, data, format='json')
        # It should create the task but ignore invalid tags because of filter logic
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task_id = response.data['id']
        task = Task.objects.get(id=task_id)
        self.assertEqual(task.task_tags.count(), 0)
