from django.core.management.base import BaseCommand
from api.models import Region
from collections import Counter

class Command(BaseCommand):
    help = 'Remove duplicate regions, keeping the first one'

    def handle(self, *args, **options):
        all_regions = Region.objects.all().order_by('id')
        seen_names = set()
        deleted_count = 0
        
        for region in all_regions:
            if region.name in seen_names:
                # This is a duplicate, delete it
                region.delete()
                deleted_count += 1
            else:
                seen_names.add(region.name)
        
        self.stdout.write(self.style.SUCCESS(
            f'Deleted {deleted_count} duplicate regions. {Region.objects.count()} regions remaining.'
        ))

