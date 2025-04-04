import os
from django.conf import settings
import requests
import math
from datetime import timedelta, date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import TripSerializer, LogSerializer


MAPBOX_API_KEY = settings.MAPBOX_API_KEY

# To follow FMCSA's policy we will calculate the Constants for trip calculations
FUEL_LIMIT_MILES = 1000  # Refueling required every 1,000 miles
DRIVING_LIMIT_HOURS = 11  # Max driving time per day
ON_DUTY_LIMIT_HOURS = 14  # Max on-duty time per day
REST_BREAK_INTERVAL_HOURS = 8  # 30-minute break required after 8 hours

def get_route_details(start, pickup, end):
    """Fetch route details from Mapbox Directions API"""
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{start};{pickup};{end}"
    params = {
        "access_token": MAPBOX_API_KEY,
        "geometries": "geojson",
        "steps": "true",
        "overview": "full"
    }
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json()
    return None

def reverse_geocode(coordinate):
    """I will convert (latitude, longitude) into a human-readable location, This is essential for 
       users to know the location of their stop (Assuming they cannot read the terms lat,lon)"""
    
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{coordinate}.json"
    params = {"access_token": MAPBOX_API_KEY}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        if "features" in data and len(data["features"]) > 0:
            return data["features"][0]["place_name"]
    return "Unknown Location"

def calculate_trip_details(route_data):
    """I will extract distance, duration, and convert time to hours/days"""
    total_miles = route_data["routes"][0]["distance"] / 1609.34  # Convert meters to miles
    total_hours = route_data["routes"][0]["duration"] / 3600  # Convert seconds to hours

    # Based on the assessment, the driver will have 1 hour for both pickup and drop-off. 
    # Further modifications can be made if the total duration should be 1 hour combined 
    # or 1 hour for each separately. For now, we will allocate 1 hour for pickup and 1 hour for drop-off.
    total_hours += 2

    total_days = math.ceil(total_hours / 24) 
    return total_hours, total_miles, total_days

def calculate_stops(total_miles, total_hours, route_geometry):
    """I will determine fuel stops and rest stops based on the route"""
    fuel_stops = max(1, int(math.floor(total_miles / FUEL_LIMIT_MILES)))
    rest_stops = max(1, int(math.floor(total_hours / REST_BREAK_INTERVAL_HOURS)))

    fuel_locations = []
    rest_locations = []

    # Select fuel stops along the route
    for i in range(fuel_stops):
        index = int((i + 1) * len(route_geometry["coordinates"]) / (fuel_stops + 1))
        coord = f"{route_geometry['coordinates'][index][0]},{route_geometry['coordinates'][index][1]}"
        fuel_locations.append(reverse_geocode(coord))

    # Select rest stops along the route
    for i in range(rest_stops):
        index = int((i + 1) * len(route_geometry["coordinates"]) / (rest_stops + 1))
        coord = f"{route_geometry['coordinates'][index][0]},{route_geometry['coordinates'][index][1]}"
        rest_locations.append(reverse_geocode(coord))

    return fuel_stops, rest_stops, fuel_locations, rest_locations

@api_view(['POST'])
def create_trip(request):
    serializer = TripSerializer(data=request.data)

    if serializer.is_valid():
        trip = serializer.save()

        # Fetch route details from Mapbox
        route_data = get_route_details(trip.current_location, trip.pickup_location, trip.dropoff_location)

        if not route_data or "routes" not in route_data or not route_data["routes"]:
            return Response({"error": "Failed to fetch valid route data from Mapbox"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Calculate trip details
        total_hours, total_miles, total_days = calculate_trip_details(route_data)
        if total_hours is None or total_miles is None or total_days is None:
            return Response({"error": "Invalid route data received"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Calculate fuel and rest stops
        fuel_stops, rest_stops, fuel_locations, rest_locations = calculate_stops(total_miles, total_hours, route_data["routes"][0]["geometry"])

        # Generate daily logs
        log_entries = []
        start_date = date.today()

        for i in range(total_days):
            log_date = start_date + timedelta(days=i)
            log_entry = Log.objects.create(
                trip=trip,
                date=log_date,
                driving_hours=min(DRIVING_LIMIT_HOURS, int(math.floor(trip.cycle_hours))),
                on_duty_hours=min(ON_DUTY_LIMIT_HOURS, int(math.floor(trip.cycle_hours))),
                off_duty_hours=10,
                sleeper_hours=0
            )
            log_entries.append(log_entry)

        # Serialize trip and logs
        trip_data = TripSerializer(trip).data
        log_data = LogSerializer(log_entries, many=True).data

        return Response({
            "trip": trip_data,
            "route_info": {
                "distance": f"{total_miles:.2f} miles",
                "duration": f"{total_hours:.2f} hours"
            },
            "stops": {
                "fuel_stops": fuel_stops,
                "rest_stops": rest_stops,
                "fuel_stop_locations": fuel_locations,
                "rest_stop_locations": rest_locations
            },
            "logs": log_data,
            "route_geometry": route_data["routes"][0]["geometry"]
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
