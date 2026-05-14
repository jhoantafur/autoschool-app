from rest_framework import viewsets
from .filters import CourseFilter
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson
from .serializers import (
    StudentSerializer, InstructorSerializer, VehicleSerializer,
    CourseSerializer, EnrollmentSerializer, LessonSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name']

class InstructorViewSet(viewsets.ModelViewSet):
    pass

class VehicleViewSet(viewsets.ModelViewSet):
    pass

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_class = CourseFilter
    search_fields = ('name', 'description')
    ordering_fields = ('price', 'duration_hours', 'created_at')
    ordering = ('-created_at',)
class EnrollmentViewSet(viewsets.ModelViewSet):
    pass

class LessonViewSet(viewsets.ModelViewSet):
    pass
