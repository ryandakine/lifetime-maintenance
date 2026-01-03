from django.contrib import admin
from .models import Part, StockAlert

@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ['part_number', 'name', 'manufacturer', 'quantity', 'min_quantity', 'lead_time_days', 'stock_status']
    list_filter = ['manufacturer', 'category', 'part_type']
    search_fields = ['name', 'part_number', 'description']
    list_editable = ['quantity', 'min_quantity', 'lead_time_days']
    ordering = ['category', 'name']
    
    def stock_status(self, obj):
        if obj.quantity <= 0:
            return '🔴 OUT OF STOCK'
        elif obj.is_low_stock:
            return '🟡 LOW STOCK'
        return '🟢 OK'
    stock_status.short_description = 'Status'


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ['part', 'alert_type', 'sent_at', 'recipient', 'acknowledged']
    list_filter = ['alert_type', 'acknowledged', 'sent_at']
    readonly_fields = ['sent_at']
