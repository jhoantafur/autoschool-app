from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, InstructorViewSet, VehicleViewSet,
    CourseViewSet, EnrollmentViewSet, LessonViewSet
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]
