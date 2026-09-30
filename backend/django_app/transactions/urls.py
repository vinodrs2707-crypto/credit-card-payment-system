from django.urls import path

from .views import (
    TransactionListView,
    CreateTransactionView,
    UpdateTransactionStatusView
)


urlpatterns = [
    path('', TransactionListView.as_view(), name='transaction-list'),

    path(
        'create/',
        CreateTransactionView.as_view(),
        name='transaction-create'
    ),

    path(
        '<int:pk>/status/',
        UpdateTransactionStatusView.as_view(),
        name='transaction-status-update'
    ),
]