import django_filters
from .models import Course


class CourseFilter(django_filters.FilterSet):
    class Meta:
        model = Course
        fields = {
            'level': ['exact'],
            'is_active': ['exact'],
        }
