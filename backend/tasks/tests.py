from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from projects.models import Project
from .models import Task

User = get_user_model()

class TaskTests(APITestCase):
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        
        # Create project
        self.project1 = Project.objects.create(title='Project 1', owner=self.user1)
        
        # URLs
        self.list_url = reverse('task-list')
        self.stats_url = reverse('dashboard-stats')

    def test_create_task(self):
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New Task', 'project': self.project1.id, 'priority': 'High'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_filter_tasks(self):
        # Create mixed tasks
        Task.objects.create(title='High Task', priority='High', owner=self.user1)
        Task.objects.create(title='Low Task', priority='Low', owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        
        # Filter by priority
        response = self.client.get(self.list_url, {'priority': 'High'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'High Task')

    def test_search_tasks(self):
        Task.objects.create(title='Buy Milk', owner=self.user1)
        Task.objects.create(title='Walk Dog', owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        
        # Search
        response = self.client.get(self.list_url, {'search': 'Milk'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Buy Milk')

    def test_dashboard_stats(self):
        # Create 3 tasks: 1 Completed High, 1 Pending Medium, 1 Pending Low
        Task.objects.create(title='T1', priority='High', is_completed=True, owner=self.user1)
        Task.objects.create(title='T2', priority='Medium', is_completed=False, owner=self.user1)
        Task.objects.create(title='T3', priority='Low', is_completed=False, owner=self.user1)
        
        # Irrelevant task (other user)
        Task.objects.create(title='T4', owner=self.user2)

        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.stats_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_tasks'], 3)
        self.assertEqual(response.data['completed_tasks'], 1)
        self.assertEqual(response.data['pending_tasks'], 2)
        self.assertEqual(response.data['tasks_by_priority']['High'], 1)
        self.assertEqual(response.data['tasks_by_priority']['Medium'], 1)
        self.assertEqual(response.data['tasks_by_priority']['Low'], 1)
