from rest_framework import serializers
from .models import BettingGroup, Bet, GroupBet, BetOutcome, MemberBet
from users.serializers import UserSerializer

class BettingGroupSerializer(serializers.ModelSerializer):
    president = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = BettingGroup
        fields = ['id', 'name', 'description', 'sports', 'president', 'members', 'created_at']
        read_only_fields = ['president', 'members', 'created_at']

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

class BetOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BetOutcome
        fields = ['id', 'outcome_key', 'outcome_name', 'odds']

class GroupBetSerializer(serializers.ModelSerializer):
    outcomes = BetOutcomeSerializer(many=True, read_only=True)
    created_by_username = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupBet
        fields = ['id', 'event_key', 'market_key', 'event_name', 'market_name', 
                  'created_at', 'active', 'start_time', 'sport', 'outcomes',
                  'created_by_username']
    
    def get_created_by_username(self, obj):
        return obj.created_by.username

class MemberBetSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    outcome_name = serializers.SerializerMethodField()
    potential_winnings = serializers.FloatField(read_only=True)
    
    class Meta:
        model = MemberBet
        fields = ['id', 'username', 'outcome_name', 'amount', 'placed_at', 
                  'status', 'potential_winnings']
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_outcome_name(self, obj):
        return obj.outcome.outcome_name