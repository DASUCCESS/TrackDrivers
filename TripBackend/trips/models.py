from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    cycle_hours = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip from {self.pickup_location} to {self.dropoff_location}"

class Log(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField() 
    driving_hours = models.FloatField()
    on_duty_hours = models.FloatField()
    off_duty_hours = models.FloatField()
    sleeper_hours = models.FloatField()

    def __str__(self):
        return f"Log for Trip {self.trip.id} on {self.date}"
