from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class Sprint0Tests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123', email='test@example.com', first_name='Test', last_name='User')

    def test_health_check(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'status': 'ok'})

    def test_user_me_endpoint(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        # DRF CamelCase middleware might change keys in real response, 
        # but in tests accessing .data directly gives snake_case keys unless using the renderer
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_cors_headers(self):
        # Basic check to ensure settings are applied
        from django.conf import settings
        self.assertIn('http://localhost:3000', settings.CORS_ALLOWED_ORIGINS)
