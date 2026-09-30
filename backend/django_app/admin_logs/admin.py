from django.contrib import admin
from .models import DailyPaymentSummary


@admin.register(DailyPaymentSummary)
class DailyPaymentSummaryAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "total_payments",
        "successful_payments",
        "failed_payments",
        "pending_payments",
        "total_amount",
    )

    ordering = ("-date",)