from decimal import Decimal

from rest_framework import serializers
from .models import Student, Instructor, Vehicle, Course, Enrollment, Lesson

PROFILE_PICTURE_MAX_BYTES = 2 * 1024 * 1024
PROFILE_PICTURE_ALLOWED_TYPES = ('image/jpeg', 'image/png', 'image/webp')

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class StudentPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('profile_picture',)

    def validate_profile_picture(self, value):
        if not value:
            raise serializers.ValidationError('Se requiere un archivo de imagen.')
        content_type = getattr(value, 'content_type', '') or ''
        if content_type not in PROFILE_PICTURE_ALLOWED_TYPES:
            raise serializers.ValidationError('Tipo no permitido. Use JPEG, PNG o WebP.')
        if value.size > PROFILE_PICTURE_MAX_BYTES:
            raise serializers.ValidationError('El archivo supera 2 MB.')
        return value

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            'id',
            'name',
            'description',
            'duration_hours',
            'price',
            'level',
            'is_active',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate_name(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError('El nombre no puede estar vacío.')
        return str(value).strip()

    def validate_duration_hours(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError('La duración en horas debe ser mayor que 0.')
        return value

    def validate_price(self, value):
        if value is None:
            raise serializers.ValidationError('El precio es requerido.')
        dec = value if isinstance(value, Decimal) else Decimal(str(value))
        if dec < 0:
            raise serializers.ValidationError('El precio debe ser mayor o igual a 0.')
        return dec

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'
