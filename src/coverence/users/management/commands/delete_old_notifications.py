from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import Notification  # adjust based on actual path

class Command(BaseCommand):
    help = "Deletes notifications older than 7 days"

    def handle(self, *args, **kwargs):
        cutoff = timezone.now() - timedelta(hours=20)
        old_notifications = Notification.objects.filter(created_at__lt=cutoff)
        count = old_notifications.count()
        old_notifications.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} notifications older than 7 days."))
