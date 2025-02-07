from rest_framework import serializers
from .models import BettingGroup, Bet
from users.serializers import UserSerializer

class BettingGroupSerializer(serializers.ModelSerializer):
    president = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = BettingGroup
        fields = ('id', 'name', 'sport', 'president', 'members', 'created_at')

class BetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bet
        fields = ('id', 'name', 'type', 'points', 'status', 'deadline') 