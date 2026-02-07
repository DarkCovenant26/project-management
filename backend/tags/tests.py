from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Tag, TaskTag
from tasks.models import Task, Subtask
from projects.models import Project

User = get_user_model()


class TagTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        self.list_url = reverse('tag-list')

    def test_create_tag(self):
        self.client.force_authenticate(user=self.user1)
        data = {'name': 'Bug', 'color': 'hsl(0 100% 50%)'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tag.objects.count(), 1)

    def test_invalid_color_format(self):
        self.client.force_authenticate(user=self.user1)
        data = {'name': 'Bug', 'color': '#ff0000'}  # Hex not allowed
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tag_isolation(self):
        """Users can only see their own tags."""
        tag1 = Tag.objects.create(name='User1Tag', color='hsl(0 100% 50%)', owner=self.user1)
        tag2 = Tag.objects.create(name='User2Tag', color='hsl(0 100% 50%)', owner=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'User1Tag')

    def test_add_tag_to_task(self):
        self.client.force_authenticate(user=self.user1)
        tag = Tag.objects.create(name='Feature', color='hsl(210 100% 50%)', owner=self.user1)
        task = Task.objects.create(title='My Task', owner=self.user1)
        
        url = reverse('task-tags-list', kwargs={'task_pk': task.id})
        response = self.client.post(url, {'tag_id': str(tag.id)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TaskTag.objects.count(), 1)


class SubtaskTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.task = Task.objects.create(title='Parent Task', owner=self.user1)

    def test_create_subtask(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-subtasks-list', kwargs={'task_pk': self.task.id})
        response = self.client.post(url, {'title': 'Subtask 1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Subtask.objects.count(), 1)

    def test_subtask_auto_order(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-subtasks-list', kwargs={'task_pk': self.task.id})
        
        self.client.post(url, {'title': 'First'}, format='json')
        self.client.post(url, {'title': 'Second'}, format='json')
        
        subtasks = Subtask.objects.filter(parent_task=self.task).order_by('order')
        self.assertEqual(subtasks[0].title, 'First')
        self.assertEqual(subtasks[0].order, 0)
        self.assertEqual(subtasks[1].title, 'Second')
        self.assertEqual(subtasks[1].order, 1)

    def test_task_has_subtask_stats(self):
        Subtask.objects.create(title='Done', is_completed=True, parent_task=self.task)
        Subtask.objects.create(title='Pending', is_completed=False, parent_task=self.task)
        
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        response = self.client.get(url)
        
        self.assertEqual(response.data['subtask_count'], 2)
        self.assertEqual(response.data['subtask_completed'], 1)
        self.assertEqual(response.data['subtask_progress'], 0.5)


class TaskStatusTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.task = Task.objects.create(title='Task', owner=self.user1)

    def test_default_status_is_backlog(self):
        self.assertEqual(self.task.status, 'backlog')

    def test_update_status_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-update-status', kwargs={'pk': self.task.id})
        response = self.client.patch(url, {'status': 'in_progress'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'in_progress')

    def test_done_status_sets_completed(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-update-status', kwargs={'pk': self.task.id})
        response = self.client.patch(url, {'status': 'done'}, format='json')
        self.task.refresh_from_db()
        self.assertTrue(self.task.is_completed)

    def test_filter_by_status(self):
        Task.objects.create(title='In Prog', status='in_progress', owner=self.user1)
        Task.objects.create(title='Done', status='done', owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-list')
        response = self.client.get(url, {'status': 'in_progress'})
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'In Prog')


class BulkOperationTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.task1 = Task.objects.create(title='Task 1', owner=self.user1)
        self.task2 = Task.objects.create(title='Task 2', owner=self.user1)

    def test_bulk_complete(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-bulk')
        response = self.client.post(url, {
            'ids': [self.task1.id, self.task2.id],
            'action': 'complete'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated'], 2)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.assertTrue(self.task1.is_completed)
        self.assertTrue(self.task2.is_completed)

    def test_bulk_set_priority(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('task-bulk')
        response = self.client.post(url, {
            'ids': [self.task1.id, self.task2.id],
            'action': 'set_priority',
            'value': 'High'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.assertEqual(self.task1.priority, 'High')
        self.assertEqual(self.task2.priority, 'High')
