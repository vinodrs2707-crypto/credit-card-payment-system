from django.db.models import Sum
from django.utils import timezone

from transactions.models import Transaction
from .models import DailyPaymentSummary


def update_daily_payment_summary():
    today = timezone.localdate()

    transactions = Transaction.objects.filter(
        created_at__date=today
    )

    total_payments = transactions.count()

    successful_payments = transactions.filter(
        status="SUCCESS"
    ).count()

    failed_payments = transactions.filter(
        status="FAILED"
    ).count()

    pending_payments = transactions.filter(
        status="PENDING"
    ).count()

    total_amount = transactions.aggregate(
        total=Sum("amount")
    )["total"] or 0

    summary, created = DailyPaymentSummary.objects.update_or_create(
        date=today,
        defaults={
            "total_payments": total_payments,
            "successful_payments": successful_payments,
            "failed_payments": failed_payments,
            "pending_payments": pending_payments,
            "total_amount": total_amount,
        }
    )

    return summary