from rest_framework import serializers
from .models import Card


class CardSerializer(serializers.ModelSerializer):
    last4 = serializers.CharField(
        write_only=True,
        min_length=4,
        max_length=4
    )

    class Meta:
        model = Card
        fields = [
            'id',
            'masked_card',
            'last4',
            'card_type',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'masked_card',
            'created_at'
        ]

    def validate_last4(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "Last 4 digits must contain only numbers."
            )
        return value

    def create(self, validated_data):
        last4 = validated_data['last4']

        validated_data['masked_card'] = f"**** **** **** {last4}"

        return Card.objects.create(**validated_data)