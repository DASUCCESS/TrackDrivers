from django.urls import path
from .views import *

urlpatterns = [
    path('create-trip/', create_trip, name="create-trip"),
    path('trips/', get_all_trips, name="get_all_trips"),
    path('trips/<int:trip_id>/', get_trip_by_id, name="get_trip_by_id"),
]
