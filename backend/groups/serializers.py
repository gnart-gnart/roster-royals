from rest_framework import serializers
from .models import League, Bet, LeagueEvent, Circuit, CircuitParticipant
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

class CircuitParticipantSerializer(serializers.ModelSerializer):
    """Serializer for circuit participants, showing basic user info."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = CircuitParticipant
        fields = ['user', 'score', 'paid_entry', 'joined_at']

class CircuitSerializer(serializers.ModelSerializer):
    """Serializer for the Circuit model."""
    captain = UserSerializer(read_only=True)
    winner = UserSerializer(read_only=True, allow_null=True)
    # Optionally include participant count or limited participant list
    participant_count = serializers.SerializerMethodField()
    # component_event_count = serializers.SerializerMethodField() # Could add if needed

    class Meta:
        model = Circuit
        fields = [
            'id', 'league', 'name', 'description', 'entry_fee',
            'tiebreaker_event', 'status', 'winner', 'captain',
            'created_at', 'start_date', 'end_date',
            'participant_count', # Added participant count
            # 'component_events' # Avoid listing all events here, fetch separately if needed
        ]
        read_only_fields = ['league', 'winner', 'captain', 'created_at', 'participant_count']

    def get_participant_count(self, obj):
        # Efficiently count participants using the related manager
        return obj.participants.count()

    # def get_component_event_count(self, obj):
    #    return obj.component_events.count()

    def validate(self, data):
        # Add any cross-field validation if needed during creation/update
        # For example, ensuring start_date is before end_date
        if 'start_date' in data and 'end_date' in data and data['start_date'] and data['end_date'] and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data 