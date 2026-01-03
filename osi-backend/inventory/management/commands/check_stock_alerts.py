"""
Django management command to check stock levels and send email alerts.
Run with: python manage.py check_stock_alerts

This can be scheduled via cron or Celery Beat to run daily.
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from inventory.models import Part, StockAlert


class Command(BaseCommand):
    help = 'Check stock levels and send email alerts for low inventory'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending emails',
        )
        parser.add_argument(
            '--email',
            type=str,
            default=settings.ALERT_RECIPIENT_EMAIL,
            help='Override the recipient email address',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        recipient = options['email']
        
        self.stdout.write(self.style.NOTICE(f'🔍 Checking stock levels...'))
        
        # Get low stock parts that haven't been alerted in the last 24 hours
        low_stock_parts = Part.objects.filter(quantity__lte=models.F('min_quantity'))
        
        # Filter out recently alerted parts
        one_day_ago = timezone.now() - timedelta(days=1)
        recently_alerted_ids = StockAlert.objects.filter(
            sent_at__gte=one_day_ago,
            acknowledged=False
        ).values_list('part_id', flat=True)
        
        parts_to_alert = low_stock_parts.exclude(id__in=recently_alerted_ids)
        
        if not parts_to_alert.exists():
            self.stdout.write(self.style.SUCCESS('✅ All stock levels are healthy!'))
            return
        
        # Build the email
        subject = f'🚨 CIMCO Stock Alert - {parts_to_alert.count()} Parts Need Attention'
        
        message_lines = [
            'The following parts are at or below minimum stock levels:',
            '',
            '-' * 60,
        ]
        
        for part in parts_to_alert:
            urgency = '🔴 CRITICAL' if part.quantity == 0 else '🟡 LOW'
            message_lines.append(
                f'{urgency} | {part.part_number or "N/A"} | {part.name}\n'
                f'   Current: {part.quantity} | Min: {part.min_quantity} | Lead Time: {part.lead_time_days} days\n'
                f'   Manufacturer: {part.manufacturer or "Unknown"}'
            )
            message_lines.append('-' * 60)
        
        message_lines.extend([
            '',
            f'Total parts needing attention: {parts_to_alert.count()}',
            '',
            '-- ',
            'Cimco Inventory System',
            'Powered by On-Site Intelligence LLC',
            'https://osi-cyber.com',
        ])
        
        message = '\n'.join(message_lines)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('📧 DRY RUN - Would send this email:'))
            self.stdout.write(f'To: {recipient}')
            self.stdout.write(f'Subject: {subject}')
            self.stdout.write(message)
        else:
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    fail_silently=False,
                )
                
                # Log the alerts
                for part in parts_to_alert:
                    StockAlert.objects.create(
                        part=part,
                        alert_type='low_stock',
                        recipient=recipient,
                    )
                
                self.stdout.write(self.style.SUCCESS(
                    f'✅ Alert sent to {recipient} for {parts_to_alert.count()} parts'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Failed to send email: {e}'))


# Fix the import at the top level
from django.db import models
