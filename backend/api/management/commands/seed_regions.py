from django.core.management.base import BaseCommand
from api.models import Region

# Algerian regions (Wilayas) with typical soil types
ALGERIAN_REGIONS = [
    {'name': 'Adrar', 'name_ar': 'أدرار', 'soil_type': 'Sand'},
    {'name': 'Chlef', 'name_ar': 'الشلف', 'soil_type': 'Loam'},
    {'name': 'Laghouat', 'name_ar': 'الأغواط', 'soil_type': 'Sand'},
    {'name': 'Oum El Bouaghi', 'name_ar': 'أم البواقي', 'soil_type': 'Loam'},
    {'name': 'Batna', 'name_ar': 'باتنة', 'soil_type': 'Loam'},
    {'name': 'Béjaïa', 'name_ar': 'بجاية', 'soil_type': 'Loam'},
    {'name': 'Biskra', 'name_ar': 'بسكرة', 'soil_type': 'Sand'},
    {'name': 'Béchar', 'name_ar': 'بشار', 'soil_type': 'Sand'},
    {'name': 'Blida', 'name_ar': 'البليدة', 'soil_type': 'Loam'},
    {'name': 'Bouira', 'name_ar': 'البويرة', 'soil_type': 'Loam'},
    {'name': 'Tamanrasset', 'name_ar': 'تمنراست', 'soil_type': 'Sand'},
    {'name': 'Tébessa', 'name_ar': 'تبسة', 'soil_type': 'Loam'},
    {'name': 'Tlemcen', 'name_ar': 'تلمسان', 'soil_type': 'Loam'},
    {'name': 'Tiaret', 'name_ar': 'تيارت', 'soil_type': 'Loam'},
    {'name': 'Tizi Ouzou', 'name_ar': 'تيزي وزو', 'soil_type': 'Loam'},
    {'name': 'Algiers', 'name_ar': 'الجزائر', 'soil_type': 'Loam'},
    {'name': 'Djelfa', 'name_ar': 'الجلفة', 'soil_type': 'Loam'},
    {'name': 'Jijel', 'name_ar': 'جيجل', 'soil_type': 'Loam'},
    {'name': 'Sétif', 'name_ar': 'سطيف', 'soil_type': 'Loam'},
    {'name': 'Saïda', 'name_ar': 'سعيدة', 'soil_type': 'Loam'},
    {'name': 'Skikda', 'name_ar': 'سكيكدة', 'soil_type': 'Loam'},
    {'name': 'Sidi Bel Abbès', 'name_ar': 'سيدي بلعباس', 'soil_type': 'Loam'},
    {'name': 'Annaba', 'name_ar': 'عنابة', 'soil_type': 'Loam'},
    {'name': 'Guelma', 'name_ar': 'قالمة', 'soil_type': 'Loam'},
    {'name': 'Constantine', 'name_ar': 'قسنطينة', 'soil_type': 'Loam'},
    {'name': 'Médéa', 'name_ar': 'المدية', 'soil_type': 'Loam'},
    {'name': 'Mostaganem', 'name_ar': 'مستغانم', 'soil_type': 'Loam'},
    {'name': 'M\'Sila', 'name_ar': 'المسيلة', 'soil_type': 'Loam'},
    {'name': 'Mascara', 'name_ar': 'معسكر', 'soil_type': 'Loam'},
    {'name': 'Ouargla', 'name_ar': 'ورقلة', 'soil_type': 'Sand'},
    {'name': 'Oran', 'name_ar': 'وهران', 'soil_type': 'Loam'},
    {'name': 'El Bayadh', 'name_ar': 'البيض', 'soil_type': 'Sand'},
    {'name': 'Illizi', 'name_ar': 'إليزي', 'soil_type': 'Sand'},
    {'name': 'Bordj Bou Arréridj', 'name_ar': 'برج بوعريريج', 'soil_type': 'Loam'},
    {'name': 'Boumerdès', 'name_ar': 'بومرداس', 'soil_type': 'Loam'},
    {'name': 'El Tarf', 'name_ar': 'الطارف', 'soil_type': 'Loam'},
    {'name': 'Tindouf', 'name_ar': 'تندوف', 'soil_type': 'Sand'},
    {'name': 'Tissemsilt', 'name_ar': 'تيسمسيلت', 'soil_type': 'Loam'},
    {'name': 'El Oued', 'name_ar': 'الوادي', 'soil_type': 'Sand'},
    {'name': 'Khenchela', 'name_ar': 'خنشلة', 'soil_type': 'Loam'},
    {'name': 'Souk Ahras', 'name_ar': 'سوق أهراس', 'soil_type': 'Loam'},
    {'name': 'Tipaza', 'name_ar': 'تيبازة', 'soil_type': 'Loam'},
    {'name': 'Mila', 'name_ar': 'ميلة', 'soil_type': 'Loam'},
    {'name': 'Aïn Defla', 'name_ar': 'عين الدفلى', 'soil_type': 'Loam'},
    {'name': 'Naâma', 'name_ar': 'النعامة', 'soil_type': 'Sand'},
    {'name': 'Aïn Témouchent', 'name_ar': 'عين تيموشنت', 'soil_type': 'Loam'},
    {'name': 'Ghardaïa', 'name_ar': 'غرداية', 'soil_type': 'Sand'},
    {'name': 'Relizane', 'name_ar': 'غليزان', 'soil_type': 'Loam'},
    {'name': 'Mitidja', 'name_ar': 'متيدجة', 'soil_type': 'Loam'},
]

class Command(BaseCommand):
    help = 'Seed Algerian regions with soil types'

    def handle(self, *args, **options):
        created_count = 0
        for region_data in ALGERIAN_REGIONS:
            region, created = Region.objects.get_or_create(
                name=region_data['name'],
                defaults={
                    'name_ar': region_data['name_ar'],
                    'soil_type': region_data['soil_type']
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} regions. Total regions: {Region.objects.count()}')
        )

