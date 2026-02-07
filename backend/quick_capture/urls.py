from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuickNoteViewSet

router = DefaultRouter()
router.register(r'quick-capture', QuickNoteViewSet, basename='quick-capture')

urlpatterns = [
    path('', include(router.urls)),
]
