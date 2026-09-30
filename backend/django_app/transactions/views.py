from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from admin_logs.views import update_daily_payment_summary
from cards.models import Card
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

        status_filter = self.request.query_params.get('status')
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        date_filter = self.request.query_params.get('date')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)

        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)

        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)

        return queryset


class CreateTransactionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = request.headers.get('X-Internal-API-Key')

        if api_key != settings.INTERNAL_API_KEY:
            return Response(
                {'detail': 'Invalid internal API key.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        card_id = request.data.get('card_id')
        amount = request.data.get('amount')
        payment_reference = request.data.get('payment_reference')
        payment_status = request.data.get('status')

        if not all([
            user_id,
            card_id,
            amount,
            payment_reference,
            payment_status
        ]):
            return Response(
                {'detail': 'All payment fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            card = Card.objects.get(
                id=card_id,
                user_id=user_id
            )
        except Card.DoesNotExist:
            return Response(
                {'detail': 'Card does not belong to this user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction = Transaction.objects.create(
            user_id=user_id,
            card=card,
            amount=amount,
            status=payment_status,
            payment_reference=payment_reference
        )
        update_daily_payment_summary()
        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_201_CREATED
        )


class UpdateTransactionStatusView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        api_key = request.headers.get('X-Internal-API-Key')

        if api_key != settings.INTERNAL_API_KEY:
            return Response(
                {'detail': 'Invalid internal API key.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            transaction = Transaction.objects.get(pk=pk)
        except Transaction.DoesNotExist:
            return Response(
                {'detail': 'Transaction not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('status')
        new_reference = request.data.get('payment_reference')

        if new_status not in ['SUCCESS', 'FAILED']:
            return Response(
                {'detail': 'Status must be SUCCESS or FAILED.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_reference:
            return Response(
                {'detail': 'Payment reference is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transaction.status = new_status
        transaction.payment_reference = new_reference
        transaction.save()
        update_daily_payment_summary()
        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_200_OK
        )