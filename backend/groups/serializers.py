from rest_framework import serializers
from .models import BettingGroup, Bet
from users.serializers import UserSerializer

class BettingGroupSerializer(serializers.ModelSerializer):
    president = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = BettingGroup
        fields = ['id', 'name', 'sport', 'president', 'members', 'created_at']
        read_only_fields = ['president']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        group = BettingGroup.objects.create(**validated_data)
        group.members.add(validated_data['president'])  # Always add the president
        for member in members:
            group.members.add(member)
        return group

class BetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bet
        fields = ('id', 'name', 'type', 'points', 'status', 'deadline') 