from django.urls import path
from .views import create_trip

urlpatterns = [
    path('create-trip/', create_trip, name="create-trip"),
]
