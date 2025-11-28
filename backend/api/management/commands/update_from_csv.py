import pandas as pd
from django.core.management.base import BaseCommand
from api.models import Region, Crop
import os

class Command(BaseCommand):
    help = 'Update database from CSV files'

    def handle(self, *args, **options):
        # 1. Remove all existing regions and replace with CSV data
        region_csv = 'data/region_soil_mapping.csv'
        if os.path.exists(region_csv):
            self.stdout.write('Removing all existing regions...')
            Region.objects.all().delete()
            
            self.stdout.write('Creating regions from region_soil_mapping.csv...')
            df_regions = pd.read_csv(region_csv)
            
            for _, row in df_regions.iterrows():
                Region.objects.create(
                    name=row['region'],
                    soil_type=row['soil_type']
                )
            
            self.stdout.write(self.style.SUCCESS(f'Regions: {Region.objects.count()} total (from CSV)'))
        
        # 2. Update Crops from agri_dataset.csv
        crop_csv = 'data/agri_dataset.csv'
        if os.path.exists(crop_csv):
            self.stdout.write('Updating Crops...')
            df_crops = pd.read_csv(crop_csv)
            unique_crops = df_crops['crop'].unique()
            
            # Default values for crops (minimal)
            for crop_name in unique_crops:
                Crop.objects.get_or_create(
                    name=crop_name,
                    defaults={
                        'ideal_ph_min': 6.0,
                        'ideal_ph_max': 7.0,
                        'water_requirement_mm': 500,
                        'growing_days': 120,
                        'base_yield_per_ha': 20.0
                    }
                )
            
            self.stdout.write(self.style.SUCCESS(f'Crops: {Crop.objects.count()} total'))
        
        # 3. Verify
        self.stdout.write('\n=== Verification ===')
        
        if os.path.exists(region_csv):
            df_regions = pd.read_csv(region_csv)
            csv_regions = set(df_regions['region'].unique())
            db_regions = set(Region.objects.values_list('name', flat=True))
            
            missing = csv_regions - db_regions
            if missing:
                self.stdout.write(self.style.ERROR(f'Missing regions in DB: {missing}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'All {len(csv_regions)} regions in database'))
        
        if os.path.exists(crop_csv):
            df_crops = pd.read_csv(crop_csv)
            csv_crops = set(df_crops['crop'].unique())
            db_crops = set(Crop.objects.values_list('name', flat=True))
            
            missing = csv_crops - db_crops
            if missing:
                self.stdout.write(self.style.ERROR(f'Missing crops in DB: {missing}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'All {len(csv_crops)} crops in database'))
        
        self.stdout.write(self.style.SUCCESS('\nDone!'))
