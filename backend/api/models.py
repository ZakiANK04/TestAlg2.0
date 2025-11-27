from django.db import models
from django.contrib.auth.models import User

class Farm(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255) # Could be lat/long later
    size_hectares = models.FloatField()
    soil_type = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Crop(models.Model):
    name = models.CharField(max_length=100)
    ideal_ph_min = models.FloatField()
    ideal_ph_max = models.FloatField()
    water_requirement_mm = models.FloatField() # mm per season
    growing_days = models.IntegerField()
    base_yield_per_ha = models.FloatField() # tons/ha
    
    def __str__(self):
        return self.name

class SoilData(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='soil_samples')
    date_tested = models.DateField()
    ph_level = models.FloatField()
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()
    organic_matter = models.FloatField()
    salinity = models.FloatField()
    texture = models.CharField(max_length=50) # e.g., "Loam", "Clay"

class WeatherData(models.Model):
    # In a real app, this might be fetched from an API and cached, or stored for historical analysis
    location = models.CharField(max_length=255)
    date = models.DateField()
    rainfall_mm = models.FloatField()
    temperature_avg = models.FloatField()
    humidity_avg = models.FloatField()
    sunshine_hours = models.FloatField()

class MarketData(models.Model):
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE)
    date = models.DateField()
    price_per_kg = models.FloatField()
    demand_index = models.FloatField(default=1.0) # 1.0 = normal, >1 high
    supply_volume_tons = models.FloatField()

    class Meta:
        ordering = ['-date']
