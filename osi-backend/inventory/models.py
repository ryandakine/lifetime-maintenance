from django.db import models

class Part(models.Model):
    """Mirrors the parts table from the Tauri/SQLite database"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, default='Shredder')
    part_type = models.CharField(max_length=50, blank=True, null=True)  # Upper, Lower, Wear Part
    manufacturer = models.CharField(max_length=100, blank=True, null=True)  # Lindemann, Metso
    part_number = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=1)
    lead_time_days = models.IntegerField(default=7)
    location = models.CharField(max_length=100, blank=True, null=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    supplier = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parts'
        ordering = ['category', 'name']
        managed = False  # Table managed by Tauri app

    def __str__(self):
        return f"{self.part_number or 'N/A'} - {self.name}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_quantity

    @property
    def needs_order_soon(self):
        """Returns True if stock is low and lead time means we should order now"""
        return self.is_low_stock and self.lead_time_days > 0


class StockAlert(models.Model):
    """Track when alerts are sent to prevent spam"""
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50, default='low_stock')
    sent_at = models.DateTimeField(auto_now_add=True)
    recipient = models.EmailField()
    acknowledged = models.BooleanField(default=False)

    class Meta:
        db_table = 'stock_alerts'

    def __str__(self):
        return f"Alert for {self.part.name} at {self.sent_at}"
