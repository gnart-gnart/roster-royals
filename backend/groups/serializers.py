from rest_framework import serializers
from .models import League, Bet, UserBet, LeagueEvent, LeagueInvite, ChatMessage, Circuit, CircuitParticipant, CircuitComponentEvent
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

class LeagueInviteSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    league = LeagueSerializer(read_only=True)

    class Meta:
        model = LeagueInvite
        fields = ('id', 'league', 'from_user', 'to_user', 'status', 'created_at')
        read_only_fields = fields

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
    completion_status = serializers.SerializerMethodField()

    class Meta:
        model = CircuitComponentEvent
        # Read league_event details, allow writing league_event_id and weight
        fields = ['league_event', 'league_event_id', 'weight', 'completion_status']
        read_only_fields = ['league_event']

    def get_completion_status(self, obj):
        """Get the completion status information for this component event"""
        event = obj.league_event
        is_completed = event.completed
        
        status_info = {
            'is_completed': is_completed,
            'requires_input': False
        }
        
        # If completed, include winner information
        if is_completed and event.market_data and 'winner' in event.market_data:
            status_info['winner'] = event.market_data.get('winner')
            
            # For tiebreaker events, include the correct numeric value
            if event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique']:
                status_info['correct_numeric_value'] = event.market_data.get('correct_numeric_value') or event.tiebreaker_correct_value
        else:
            # If not completed, indicate if captain input is required
            status_info['requires_input'] = True
            
            # For tiebreaker events, flag that numeric input is required
            if event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique']:
                status_info['requires_numeric_input'] = True
            
            # Include possible outcomes for standard events
            if event.betting_type == 'standard':
                outcomes = []
                if event.market_data and 'options' in event.market_data:
                    outcomes = event.market_data.get('options', [])
                elif event.home_team and event.away_team:
                    outcomes = [event.home_team, event.away_team]
                status_info['possible_outcomes'] = outcomes
        
        return status_info

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
    """Detailed serializer for Circuit data with component events."""
    component_events = CircuitComponentEventSerializer(source='circuitcomponentevent_set', many=True, read_only=True)
    participants = CircuitParticipantSerializer(many=True, read_only=True)
    captain = UserSerializer(read_only=True)
    tiebreaker_event = LeagueEventSerializer(read_only=True)
    league = LeagueSerializer(read_only=True)
    completion_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Circuit
        fields = [
            'id', 'name', 'description', 'entry_fee', 'component_events',
            'participants', 'tiebreaker_event', 'status', 'winner',
            'captain', 'league', 'created_at', 'start_date', 'end_date',
            'completion_status'
        ]
        
    def get_completion_status(self, obj):
        """Get information about the circuit's completion status"""
        # Get all component events
        component_events = obj.circuitcomponentevent_set.all()
        total_events = component_events.count()
        completed_events = sum(1 for ce in component_events if ce.league_event.completed)
        
        # Calculate progress
        progress_percentage = (completed_events / total_events * 100) if total_events > 0 else 0
        
        # Check if there are any tied participants
        has_tie = False
        tied_participants = []
        
        if obj.participants.exists():
            participants = obj.participants.all()
            sorted_participants = sorted(participants, key=lambda p: p.score, reverse=True)
            
            if len(sorted_participants) > 1 and sorted_participants[0].score == sorted_participants[1].score:
                top_score = sorted_participants[0].score
                tied_participants = [p for p in sorted_participants if p.score == top_score]
                has_tie = len(tied_participants) > 1
        
        # Check if all events are completed
        all_events_completed = completed_events == total_events
        
        # Check if tiebreaker is needed and available
        tiebreaker_needed = has_tie and all_events_completed
        tiebreaker_available = obj.tiebreaker_event is not None
        
        # Get the next event to complete (if any)
        next_event = None
        if not all_events_completed:
            for ce in component_events:
                if not ce.league_event.completed:
                    next_event = {
                        'id': ce.league_event.id,
                        'name': ce.league_event.event_name,
                        'weight': ce.weight,
                        'type': ce.league_event.betting_type
                    }
                    break
        
        return {
            'total_events': total_events,
            'completed_events': completed_events,
            'progress_percentage': progress_percentage,
            'all_events_completed': all_events_completed,
            'has_tie': has_tie,
            'tied_participants_count': len(tied_participants) if has_tie else 0,
            'tiebreaker_needed': tiebreaker_needed,
            'tiebreaker_available': tiebreaker_available,
            'ready_for_completion': all_events_completed and (not has_tie or not tiebreaker_available),
            'next_event': next_event
        }

class UserBetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBet
        fields = ('id', 'user', 'bet', 'choice', 'points_wagered', 'result', 'created_at', 'league_event', 'numeric_choice', 'points_earned') 