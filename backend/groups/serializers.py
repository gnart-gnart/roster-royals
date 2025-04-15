from rest_framework import serializers
from .models import League, Bet, LeagueEvent, ChatMessage, Circuit, CircuitParticipant, CircuitComponentEvent
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

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'league', 'sender', 'message', 'created_at']
        read_only_fields = ['sender', 'created_at'] 
        fields = '__all__'

class CircuitParticipantSerializer(serializers.ModelSerializer):
    """Serializer for circuit participants, showing basic user info."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = CircuitParticipant
        fields = ['user', 'score', 'paid_entry', 'joined_at']

class CircuitComponentEventSerializer(serializers.ModelSerializer):
    """Serializer for CircuitComponentEvent, used for creating/reading weights."""
    # Include LeagueEvent details when reading
    league_event = LeagueEventSerializer(read_only=True)
    league_event_id = serializers.PrimaryKeyRelatedField(
        queryset=LeagueEvent.objects.all(), source='league_event', write_only=True
    )

    class Meta:
        model = CircuitComponentEvent
        # Read league_event details, allow writing league_event_id and weight
        fields = ['league_event', 'league_event_id', 'weight']
        read_only_fields = ['league_event']

class CircuitCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating a new Circuit."""
    component_events_data = CircuitComponentEventSerializer(many=True, write_only=True)
    # Allow setting tiebreaker by ID during creation
    tiebreaker_event_id = serializers.PrimaryKeyRelatedField(
        queryset=LeagueEvent.objects.all(), source='tiebreaker_event', allow_null=True, required=False
    )

    class Meta:
        model = Circuit
        fields = [
            'name', 'description', 'entry_fee', 'start_date', 'end_date',
            'component_events_data', # Use this field for input
            'tiebreaker_event_id' # Use this field for input
        ]
        # Note: 'league' and 'captain' will be set in the view based on context

    def validate_component_events_data(self, value):
        if not value:
            raise serializers.ValidationError("At least one component event must be selected.")
        # Check for duplicate league event IDs
        event_ids = [item['league_event'].id for item in value]
        if len(event_ids) != len(set(event_ids)):
            raise serializers.ValidationError("Duplicate component events selected.")
        return value

    def validate(self, data):
        # Ensure tiebreaker is one of the selected component events if provided
        tiebreaker_event = data.get('tiebreaker_event')
        component_events_data = data.get('component_events_data')

        if tiebreaker_event and component_events_data:
            component_event_ids = [item['league_event'].id for item in component_events_data]
            if tiebreaker_event.id not in component_event_ids:
                raise serializers.ValidationError("The tiebreaker event must be one of the selected component events.")
            # Check tiebreaker type (already handled in model clean, but can double-check here)
            if tiebreaker_event.betting_type == 'standard':
                 raise serializers.ValidationError("The selected tiebreaker event must have a tiebreaker betting type.")

        # Ensure start_date is before end_date if both provided
        if data.get('start_date') and data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")

        return data

    def create(self, validated_data):
        component_events_input = validated_data.pop('component_events_data')
        # league and captain are added from context in the view
        circuit = Circuit.objects.create(**validated_data)

        # Create through model instances
        for event_data in component_events_input:
            CircuitComponentEvent.objects.create(
                circuit=circuit,
                league_event=event_data['league_event'],
                weight=event_data['weight']
            )
        return circuit

class CircuitSerializer(serializers.ModelSerializer):
    """Serializer for the Circuit model (primarily for reading)."""
    captain = UserSerializer(read_only=True)
    winner = UserSerializer(read_only=True, allow_null=True)
    participant_count = serializers.SerializerMethodField()
    # Optionally serialize the tiebreaker event details
    tiebreaker_event = LeagueEventSerializer(read_only=True)

    class Meta:
        model = Circuit
        fields = [
            'id', 'league', 'name', 'description', 'entry_fee',
            'tiebreaker_event', 'status', 'winner', 'captain',
            'created_at', 'start_date', 'end_date',
            'participant_count',
        ]
        read_only_fields = ['id', 'league', 'winner', 'captain', 'created_at', 'participant_count', 'tiebreaker_event']

    def get_participant_count(self, obj):
        return obj.participants.count()

# --- New Serializer for Detail View --- 
class CircuitDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed Circuit view, including components and participants."""
    captain = UserSerializer(read_only=True)
    winner = UserSerializer(read_only=True, allow_null=True)
    tiebreaker_event = LeagueEventSerializer(read_only=True)
    component_events = CircuitComponentEventSerializer(many=True, source='circuitcomponentevent_set', read_only=True) # Use source for reverse relation
    participants = CircuitParticipantSerializer(many=True, read_only=True)
    league = LeagueSerializer(read_only=True) # Include basic league info

    class Meta:
        model = Circuit
        fields = [
            'id', 'league', 'name', 'description', 'entry_fee',
            'tiebreaker_event', 'status', 'winner', 'captain',
            'created_at', 'start_date', 'end_date',
            'component_events', # Include related component events with weights
            'participants' # Include list of participants with scores
        ]
        read_only_fields = fields # Make all fields read-only for detail view 