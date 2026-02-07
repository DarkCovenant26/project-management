from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Project
from tasks.models import Task

User = get_user_model()

class ProjectTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        self.list_url = reverse('project-list-create')

    def test_create_project(self):
        self.client.force_authenticate(user=self.user1)
        data = {'name': 'New Project', 'description': 'Test desc'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)

    def test_project_pagination(self):
        for i in range(25):
            Project.objects.create(name=f'Project {i}', owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.data['count'], 25)
        self.assertEqual(len(response.data['results']), 20) # Default page size

    def test_update_project(self):
        project = Project.objects.create(name='Old', owner=self.user1)
        self.client.force_authenticate(user=self.user1)
        url = reverse('project-detail', args=[project.id])
        
        response = self.client.patch(url, {'name': 'New'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.name, 'New')

    def test_cascade_delete(self):
        project = Project.objects.create(name='To Delete', owner=self.user1)
        Task.objects.create(title='Task 1', project=project, owner=self.user1)
        Task.objects.create(title='Task 2', project=project, owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        url = reverse('project-detail', args=[project.id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)
        self.assertEqual(Task.objects.count(), 0) # Cascade delete should work

    def test_unauthorized_project_access(self):
        project = Project.objects.create(name='User 1 Project', owner=self.user1)
        self.client.force_authenticate(user=self.user2)
        url = reverse('project-detail', args=[project.id])
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
