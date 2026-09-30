import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import Transaction


@admin.action(description="Export selected transactions to CSV")
def export_transactions_csv(modeladmin, request, queryset):
    response = HttpResponse(
        content_type="text/csv"
    )

    response["Content-Disposition"] = (
        'attachment; filename="transactions.csv"'
    )

    writer = csv.writer(response)

    writer.writerow([
        "ID",
        "User",
        "Card",
        "Amount",
        "Status",
        "Payment Reference",
        "Created At",
    ])

    for transaction in queryset:
        writer.writerow([
            transaction.id,
            transaction.user.username,
            transaction.card.id,
            transaction.amount,
            transaction.status,
            transaction.payment_reference,
            transaction.created_at,
        ])

    return response


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    actions = [
        export_transactions_csv,
    ]