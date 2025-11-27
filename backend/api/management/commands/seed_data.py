from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Farm, Crop, SoilData, WeatherData, MarketData
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding massive dataset...')

        # Create User
        user, created = User.objects.get_or_create(username='farmer_ali')
        if created:
            user.set_password('password123')
            user.save()

        # Create Farm
        farm, created = Farm.objects.get_or_create(
            user=user,
            name="Green Valley Farm",
            defaults={
                'location': "Mitidja",
                'size_hectares': 10.0,
                'soil_type': "Loam"
            }
        )

        # Clear existing dynamic data to avoid duplicates on re-run
        Crop.objects.all().delete()
        MarketData.objects.all().delete()
        WeatherData.objects.all().delete()

        # 1. Create 20+ Crops
        crop_templates = [
            ("Potato", 600, 120, 30), ("Carrot", 450, 90, 40), ("Onion", 500, 150, 35),
            ("Tomato", 550, 100, 60), ("Wheat", 400, 180, 5), ("Barley", 350, 160, 4),
            ("Corn", 600, 110, 10), ("Lettuce", 300, 60, 25), ("Pepper", 500, 120, 20),
            ("Eggplant", 550, 130, 25), ("Zucchini", 450, 50, 30), ("Pumpkin", 500, 140, 40),
            ("Garlic", 400, 200, 10), ("Strawberry", 450, 90, 15), ("Watermelon", 600, 100, 50),
            ("Melon", 550, 95, 30), ("Spinach", 350, 45, 12), ("Cabbage", 500, 80, 45),
            ("Cauliflower", 500, 85, 20), ("Broccoli", 500, 85, 18), ("Beans", 400, 70, 10),
            ("Peas", 350, 65, 8), ("Cucumber", 500, 60, 40), ("Beetroot", 450, 70, 25)
        ]

        for name, water, days, yield_t in crop_templates:
            Crop.objects.create(
                name=name,
                ideal_ph_min=5.5 + random.uniform(-0.5, 0.5),
                ideal_ph_max=7.0 + random.uniform(-0.5, 0.5),
                water_requirement_mm=water + random.uniform(-50, 50),
                growing_days=days,
                base_yield_per_ha=yield_t
            )

        # 2. Create Market Data for each crop
        # Randomize supply/demand to create "winners" and "losers"
        for crop in Crop.objects.all():
            # Randomize market conditions
            scenario = random.choice(['glut', 'scarcity', 'normal', 'normal', 'normal'])
            
            if scenario == 'glut':
                supply = random.uniform(2000, 5000)
                demand = random.uniform(0.5, 0.9)
                price = random.uniform(10, 40)
            elif scenario == 'scarcity':
                supply = random.uniform(100, 500)
                demand = random.uniform(1.1, 2.0)
                price = random.uniform(100, 300)
            else:
                supply = random.uniform(800, 1500)
                demand = random.uniform(0.9, 1.1)
                price = random.uniform(40, 120)

            MarketData.objects.create(
                crop=crop,
                date=date.today(),
                price_per_kg=round(price, 2),
                demand_index=round(demand, 2),
                supply_volume_tons=round(supply, 2)
            )

        # 3. Create Weather Data (Historical/Forecast)
        # Create 30 days of weather data
        base_date = date.today()
        for i in range(30):
            day = base_date + timedelta(days=i)
            WeatherData.objects.create(
                location="Mitidja",
                date=day,
                rainfall_mm=random.uniform(0, 20) if i % 5 != 0 else random.uniform(20, 60), # Occasional rain
                temperature_avg=random.uniform(15, 25),
                humidity_avg=random.uniform(40, 80),
                sunshine_hours=random.uniform(4, 10)
            )
            
        # Also create a summary record for the "season" which the engine uses
        WeatherData.objects.create(
            location="Mitidja",
            date=date.today(),
            rainfall_mm=500 + random.uniform(-100, 100), # Seasonal total
            temperature_avg=18,
            humidity_avg=65,
            sunshine_hours=8
        )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {Crop.objects.count()} crops and market data.'))
