from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from .filters import CourseFilter
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson
from .serializers import (
    StudentSerializer, StudentPictureSerializer, InstructorSerializer, VehicleSerializer,
    CourseSerializer, EnrollmentSerializer, LessonSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name']

    @action(
        detail=True,
        methods=['post'],
        url_path='upload-picture',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_picture(self, request, pk=None):
        student = self.get_object()
        file_obj = request.FILES.get('profile_picture')
        if not file_obj:
            return Response(
                {'detail': 'Falta el archivo profile_picture.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = StudentPictureSerializer(
            student,
            data={'profile_picture': file_obj},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        student.refresh_from_db()
        return Response(
            StudentSerializer(student, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

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
