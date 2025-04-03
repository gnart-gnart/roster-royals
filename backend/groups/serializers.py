from rest_framework import serializers
from .models import League, Bet, LeagueEvent
from users.serializers import UserSerializer

class LeagueSerializer(serializers.ModelSerializer):
    captain = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = League
        fields = ['id', 'name', 'description', 'sports', 'captain', 'members', 'created_at', 'image']
        read_only_fields = ['captain', 'members', 'created_at']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        league = League.objects.create(**validated_data)
        league.members.add(validated_data['captain'])  # Always add the captain
        for member in members:
            league.members.add(member)
        return league

class BetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bet
        fields = ('id', 'name', 'type', 'points', 'status', 'deadline')

class LeagueEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeagueEvent
        fields = '__all__' 