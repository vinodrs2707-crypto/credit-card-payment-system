from django.db import models


class DailyPaymentSummary(models.Model):
    date = models.DateField(unique=True)
    total_payments = models.PositiveIntegerField(default=0)
    successful_payments = models.PositiveIntegerField(default=0)
    failed_payments = models.PositiveIntegerField(default=0)
    pending_payments = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return str(self.date)