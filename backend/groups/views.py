from django.shortcuts import render, get_object_or_404
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics, status
from .models import League, Bet, UserBet, LeagueInvite, LeagueEvent, ChatMessage, Circuit, CircuitComponentEvent, CircuitParticipant
from users.models import User, Notification, FriendRequest
from .serializers import LeagueSerializer, BetSerializer, LeagueEventSerializer, ChatMessageSerializer, CircuitSerializer, CircuitCreateSerializer, CircuitDetailSerializer, UserBetSerializer, LeagueInviteSerializer, CircuitComponentEventSerializer
import logging
import json
import requests
import uuid
from decimal import Decimal
from django.utils import timezone
from .odds import OddsApiClient
from rest_framework import serializers

logger = logging.getLogger(__name__)

class CreateLeagueView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeagueSerializer

    def perform_create(self, serializer):
        try:
            # Create league with current user as captain
            league = serializer.save(captain=self.request.user)
            # Add captain as first member
            league.members.add(self.request.user)
            return league
        except Exception as e:
            logger.error(f"Error creating league: {str(e)}")
            raise serializers.ValidationError(str(e))

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_league_member(request, league_id, user_id):
    try:
        league = League.objects.get(id=league_id, captain=request.user)
        user = User.objects.get(id=user_id)
        league.members.add(user)
        return Response({'message': 'Member added successfully'})
    except League.DoesNotExist:
        return Response({'error': 'League not found or not authorized'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leagues(request):
    user = request.user
    leagues = League.objects.filter(members=user)
    return Response(LeagueSerializer(leagues, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_league(request, league_id, user_id):
    print(f"\nProcessing league invite:")
    print(f"- From: {request.user.username}")
    print(f"- League ID: {league_id}")
    print(f"- To User ID: {user_id}")
    
    try:
        league = League.objects.get(id=league_id)
        to_user = User.objects.get(id=user_id)
        
        print(f"Found league '{league.name}' and user '{to_user.username}'")
        
        # Check if user is captain
        if request.user != league.captain:
            print(f"ERROR: {request.user.username} is not captain of this league")
            return Response({'error': 'Only league captain can invite members'}, status=403)
        
        # Check if user is already a member
        if to_user in league.members.all():
            print(f"ERROR: {to_user.username} is already a member of this league")
            return Response({'error': f'{to_user.username} is already a member of this league'}, status=400)
        
        # Check if there's already a pending invite
        existing_invite = LeagueInvite.objects.filter(league=league, to_user=to_user, status='pending').first()
        if existing_invite:
            print(f"ERROR: {to_user.username} already has a pending invite to this league")
            return Response({'error': f'An invitation for {to_user.username} already exists'}, status=400)
        
        # Create invite
        invite = LeagueInvite.objects.create(
            league=league,
            to_user=to_user,
            status='pending'
        )
        print(f"Created LeagueInvite with ID: {invite.id}")

        # Create notification
        notification = Notification.objects.create(
            user=to_user,
            message=f"{request.user.username} invited you to join {league.name}",
            notification_type='league_invite',
            requires_action=True,
            reference_id=invite.id
        )
        print(f"""
        Created Notification:
        - ID: {notification.id}
        - Type: {notification.notification_type}
        - For User: {notification.user.username}
        - Message: {notification.message}
        - Requires Action: {notification.requires_action}
        - Reference ID: {notification.reference_id}
        """)
        
        # Verify notification exists
        verify = Notification.objects.get(id=notification.id)
        print(f"Verified notification exists with ID {verify.id}")
        
        return Response({
            'message': 'Invite sent successfully',
            'invite_id': invite.id,
            'notification_id': notification.id
        })
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_league_invite(request, invite_id):
    try:
        invite = LeagueInvite.objects.get(
            id=invite_id,
            to_user=request.user,
            status='pending'
        )
        action = request.data.get('action')
        
        if action == 'accept':
            invite.status = 'accepted'
            invite.save()
            invite.league.members.add(request.user)
            
            # Create notification for league captain
            Notification.objects.create(
                user=invite.league.captain,
                message=f"{request.user.username} joined {invite.league.name}",
                notification_type='info'
            )
            
            # Delete the invitation notification
            Notification.objects.filter(
                user=request.user,
                notification_type='league_invite',
                requires_action=True
            ).delete()
            
            return Response({'message': 'Invite accepted'})
            
        elif action == 'reject':
            invite.status = 'rejected'
            invite.save()
            
            # Delete the invitation notification
            Notification.objects.filter(
                user=request.user,
                notification_type='league_invite',
                requires_action=True
            ).delete()
            
            return Response({'message': 'Invite rejected'})
            
    except LeagueInvite.DoesNotExist:
        return Response({'error': 'Invite not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_league(request, league_id):
    print(f"\nFetching league details:")
    print(f"- League ID: {league_id}")
    print(f"- User: {request.user.username}")
    
    try:
        league = League.objects.get(id=league_id)
        print(f"Found league: {league.name}")
        serialized_data = LeagueSerializer(league).data
        print(f"Serialized data: {serialized_data}")
        return Response(serialized_data)
    except League.DoesNotExist:
        print(f"League {league_id} not found")
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_bets(request, sport=None):
    try:
        print("\nDEBUG: Fetching bets")
        print(f"Sport param: {sport}")
        
        client = OddsApiClient()
        if sport:
            print(f"Fetching events for sport: {sport}")
            # Get events for the specified sport
            events = client.get_sport_events(sport)
            print(f"Events response: {events}")
            return Response(events)
        else:
            print("Fetching all sports")
            sports_data = client.get_sports()
            print(f"Sports response: {sports_data}")
            return Response(sports_data)
    except Exception as e:
        print(f"ERROR in get_available_bets: {str(e)}")
        print(f"Error type: {type(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_bets_endpoint(request):
    print("Test endpoint hit!")
    return Response({"message": "Test endpoint working"}) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_event_details(request, event_id):
    try:
        print(f"\nFetching event details for event ID: {event_id}")
        
        # First, try to find the event in our local database
        try:
            # Check if event_id is an integer (for local events)
            if event_id.isdigit():
                event = LeagueEvent.objects.get(id=int(event_id))
                print(f"Found local event: {event.event_name}")
                serializer = LeagueEventSerializer(event)
                return Response(serializer.data)
        except (ValueError, LeagueEvent.DoesNotExist):
            print(f"Event {event_id} not found in local DB, trying external API")
        
        # If not found locally or not an integer ID, try the external API
        client = OddsApiClient()
        event_details = client.get_event_odds(event_id)
        return Response(event_details)
    except Exception as e:
        print(f"ERROR in get_event_details: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bet(request):
    try:
        data = request.data
        print(f"\nProcessing bet placement:")
        print(f"- User: {request.user.username}")
        
        required_fields = ['leagueId', 'eventKey', 'marketKey', 'outcomeKey', 'amount', 'odds']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Missing required field: {field}'}, status=400)
        
        league_id = data['leagueId']
        event_key = data['eventKey']
        market_key = data['marketKey']
        outcome_key = data['outcomeKey']
        amount = data['amount']
        odds = data['odds']
        
        try:
            league = League.objects.get(id=league_id)
        except League.DoesNotExist:
            return Response({'error': 'League not found'}, status=404)
        
        if request.user not in league.members.all():
            return Response({'error': 'You are not a member of this league'}, status=403)
        
        # Create a Bet record. For simplicity:
        # - name is set to event_key
        # - type is set to market_key
        # - points is used to store the wager amount (in US dollars)
        # - deadline is set to now + 1 hour
        now = datetime.datetime.now()
        deadline = now + datetime.timedelta(hours=1)
        
        bet = Bet.objects.create(
            league=league,
            name=event_key,
            type=market_key,
            points=amount,
            status='open',
            deadline=deadline
        )
        
        # Create a UserBet record to link this bet to the user
        UserBet.objects.create(
            user=request.user,
            bet=bet,
            choice=outcome_key,
            points_wagered=amount
        )
        
        # Handle circuit bet if specified
        if 'circuitId' in request.data or request.data.get('isCircuitBet'):
            circuit_id = request.data.get('circuitId')
            
            if not circuit_id:
                return Response({
                    'error': 'Circuit ID is required for circuit bets'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                circuit = Circuit.objects.get(id=circuit_id)
                
                # Check if user is a participant in the circuit
                try:
                    participant = CircuitParticipant.objects.get(circuit=circuit, user=request.user)
                except CircuitParticipant.DoesNotExist:
                    return Response({
                        'error': 'You are not a participant in this circuit'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Create a UserBet record linking this bet to the circuit event
                if league_event:
                    # Check if this is a component event of the circuit
                    try:
                        component = CircuitComponentEvent.objects.get(circuit=circuit, league_event=league_event)
                        
                        # Determine the points wagered based on component weight
                        points_wagered = component.weight
                        
                        # Create the user bet
                        user_bet = UserBet.objects.create(
                            user=request.user,
                            bet=bet,
                            league_event=league_event,
                            choice=outcome_key,
                            points_wagered=points_wagered,
                            points_earned=0,  # Will be calculated when event is completed
                            result='pending'
                        )
                        
                        # Add this event to the participant's completed_bets
                        participant.completed_bets.add(league_event)
                        
                        # Update response with circuit information
                        response_data = {
                            'circuit_id': circuit.id,
                            'points_wagered': points_wagered,
                            'user_bet_id': user_bet.id
                        }
                        
                        return Response(response_data, status=status.HTTP_201_CREATED)
                        
                    except CircuitComponentEvent.DoesNotExist:
                        return Response({
                            'error': 'This event is not part of the specified circuit'
                        }, status=status.HTTP_400_BAD_REQUEST)
            except Circuit.DoesNotExist:
                return Response({
                    'error': 'Circuit not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'message': 'Bet placed successfully',
            'betId': bet.id
        })
    except Exception as e:
        print(f"ERROR in place_bet: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_competition_events(request, competition_key):
    try:
        print(f"\nFetching events for sport: {competition_key}")
        client = OddsApiClient()
        
        # In Odds API, we don't have competitions, we directly get events for a sport
        events = client.get_sport_events(competition_key)
        print(f"Sport events response: {events}")
        return Response(events)
            
    except Exception as e:
        print(f"ERROR in get_competition_events: {str(e)}")
        print(f"Error type: {type(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_league_event(request):
    try:
        data = request.data
        league_id = data.get('league_id')
        event_key = data.get('event_key')
        event_id = data.get('event_id')
        event_name = data.get('event_name')
        sport = data.get('sport')
        commence_time = data.get('commence_time')
        home_team = data.get('home_team', '')
        away_team = data.get('away_team', '')
        market_data = data.get('market_data', {})
        outcome_key = data.get('outcomeKey', None)
        wager_amount = data.get('amount', 0)
        
        # Check if this is a circuit bet
        is_circuit_bet = data.get('isCircuitBet', False)
        circuit_id = data.get('circuitId', None)
        
        if not league_id:
            return Response({
                'error': 'League ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            league = League.objects.get(id=league_id)
        except League.DoesNotExist:
            return Response({
                'error': 'League not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is a member of the league
        if request.user not in league.members.all():
            return Response({
                'error': 'You are not a member of this league'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the event already exists in the league
        league_event = None
        try:
            if event_id:
                league_event = LeagueEvent.objects.get(id=event_id, league=league)
            elif event_key:
                league_event = LeagueEvent.objects.get(event_key=event_key, league=league)
        except LeagueEvent.DoesNotExist:
            # Event doesn't exist, create it
            market_data_to_save = market_data
            if isinstance(market_data_to_save, str):
                market_data_to_save = json.loads(market_data_to_save)
            
            league_event = LeagueEvent.objects.create(
                league=league,
                event_key=event_key,
                event_id=event_id,
                event_name=event_name,
                sport=sport,
                commence_time=commence_time,
                home_team=home_team,
                away_team=away_team,
                market_data=market_data_to_save
            )
        
        # Create a bet record
        bet = Bet.objects.create(
            league=league,
            name=f"Bet on {event_name}",
            type="moneyline",  # Default
            points=10,  # Default
            status="open",
            deadline=commence_time or timezone.now() + timezone.timedelta(days=1)
        )
        
        # Get extra bet data
        numeric_choice = None
        choice_value = outcome_key
        is_tiebreaker = False
        
        # Create circuit bet if specified
        if is_circuit_bet and circuit_id:
            try:
                circuit = Circuit.objects.get(id=circuit_id)
                
                # Check if user is a participant in the circuit
                try:
                    participant = CircuitParticipant.objects.get(circuit=circuit, user=request.user)
                except CircuitParticipant.DoesNotExist:
                    return Response({
                        'error': 'You are not a participant in this circuit'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Check if this is a component event of the circuit
                try:
                    component = CircuitComponentEvent.objects.get(circuit=circuit, league_event=league_event)
                    
                    # Check if this is a tiebreaker event
                    is_tiebreaker = circuit.tiebreaker_event and circuit.tiebreaker_event.id == league_event.id
                    
                    # If tiebreaker and numeric value provided, use it
                    if is_tiebreaker and league_event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique']:
                        numeric_choice = float(outcome_key)
                        choice_value = ''  # Clear choice for numeric tiebreakers
                    
                    # Determine the points wagered based on component weight
                    points_wagered = component.weight
                    
                    # Create the user bet
                    user_bet = UserBet.objects.create(
                        user=request.user,
                        bet=bet,
                        league_event=league_event,
                        choice=choice_value,
                        numeric_choice=numeric_choice,
                        points_wagered=points_wagered,
                        points_earned=0,  # Will be calculated when event is completed
                        result='pending'
                    )
                    
                    # Add this event to the participant's completed_bets
                    participant.completed_bets.add(league_event)
                    
                    # Update response with circuit information
                    response_data = {
                        'circuit_id': circuit.id,
                        'points_wagered': points_wagered,
                        'user_bet_id': user_bet.id
                    }
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
                    
                except CircuitComponentEvent.DoesNotExist:
                    return Response({
                        'error': 'This event is not part of the specified circuit'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Circuit.DoesNotExist:
                return Response({
                    'error': 'Circuit not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # For regular bets (not circuit bets)
        # Create user bet entry
        user_bet = UserBet.objects.create(
            user=request.user,
            bet=bet,
            league_event=league_event,
            choice=outcome_key,
            points_wagered=10  # Default
        )
        
        # Handle monetary wager if provided
        if wager_amount and float(wager_amount) > 0:
            # Check if user has enough money
            if request.user.money < Decimal(str(wager_amount)):
                return Response({
                    'error': 'Insufficient funds'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct money from user
            request.user.money -= Decimal(str(wager_amount))
            request.user.save()
                  
        # Regular bet response
        response_data = {
            'message': 'Bet placed successfully',
            'bet_id': bet.id,
            'league_event_id': league_event.id,
            'is_circuit_bet': False
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_league_events(request, league_id):
    """Get all betting events for a specific league."""
    try:
        # Ensure the league exists
        league = League.objects.get(id=league_id)
        
        # Ensure user is a member of the league
        if request.user not in league.members.all():
            return Response({'error': 'You are not a member of this league'}, status=403)
            
        # Get all events for this league
        events = LeagueEvent.objects.filter(league=league).order_by('-created_at')
        
        # Serialize and return the events
        serializer = LeagueEventSerializer(events, many=True)
        return Response(serializer.data)
        
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching league events: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def browse_market(request):
    """
    Endpoint for the "browse market" page.
    Returns sports grouped by their category.
    """
    try:
        client = OddsApiClient()
        # Log API key for debugging (mask most of it for security)
        masked_key = client.api_key[:4] + '...' + client.api_key[-4:] if len(client.api_key) > 8 else '***'
        logger.debug(f"Using Odds API key: {masked_key}")
        
        sports_data = client.get_sports()
        
        logger.debug(f"Retrieved sports data: {sports_data}")
        
        return Response({
            'message': 'Sports data retrieved successfully',
            'data': sports_data
        })
    except requests.exceptions.HTTPError as http_err:
        error_msg = f"HTTP error occurred: {http_err}"
        if hasattr(http_err.response, 'status_code') and http_err.response.status_code == 422:
            error_msg = f"API key validation error (422): {http_err.response.text if hasattr(http_err.response, 'text') else str(http_err)}"
        logger.error(error_msg)
        return Response({'error': error_msg}, status=500)    
    except Exception as e:
        logger.error(f"Error in browse_market: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_league_event(request, event_id):
    try:
        # Retrieve the league event
        try:
            event = LeagueEvent.objects.get(id=event_id)
        except LeagueEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=404)
        
        # Check if user is authorized to complete this event
        if request.user != event.league.captain:
            return Response({'error': 'Only the league captain can complete this event'}, status=403)
        
        # Validate request data
        data = request.data
        
        # Check for either winner or winning_outcome in the request data
        winner = data.get('winner') or data.get('winning_outcome')
        if not winner:
            return Response({'error': 'Winner must be specified'}, status=400)
        
        # Mark the event as completed
        event.completed = True
        
        # Process results for all user bets
        if event.market_data and 'user_bets' in event.market_data:
            user_bets = event.market_data.get('user_bets', [])
            logger.info(f"Found {len(user_bets)} user bets in market_data")
            
            for i, user_bet in enumerate(user_bets):
                try:
                    # Get user bet details
                    user_id = user_bet.get('user_id')
                    choice = user_bet.get('outcomeKey')
                    amount = float(user_bet.get('amount', 0))
                    odds = float(user_bet.get('odds', 2.0))
                    
                    if not user_id or not choice or amount <= 0:
                        logger.warning(f"Incomplete bet data: {user_bet}")
                        continue
                    
                    # Determine the result
                    result = 'lost'
                    payout = 0
                    
                    # Check if the user bet matches the winning outcome
                    if choice.lower() == winner.lower():
                        result = 'won'
                        # Calculate payout with odds
                        payout = amount * odds
                        
                        # Find user and update their money
                        try:
                            user = User.objects.get(id=user_id)
                            user.money += Decimal(str(payout))
                            user.save()
                            logger.info(f"User {user.username} won {payout} on event {event.event_name}")
                            
                            # Create notification for the win
                            Notification.objects.create(
                                user=user,
                                message=f"You won ${payout:.2f} on {event.event_name}!",
                                notification_type='info'
                            )
                            logger.info(f"Created win notification for user {user.username}")
                        except User.DoesNotExist:
                            logger.warning(f"User with ID {user_id} not found for payout")
                    else:
                        # User lost - create notification
                        try:
                            user = User.objects.get(id=user_id)
                            Notification.objects.create(
                                user=user,
                                message=f"You lost your bet of ${amount:.2f} on {event.event_name}",
                                notification_type='info'
                            )
                            logger.info(f"Created loss notification for user {user.username}")
                        except User.DoesNotExist:
                            logger.warning(f"User with ID {user_id} not found for loss notification")
                    
                    # Update the user bet with the result
                    event.market_data['user_bets'][i]['result'] = result
                    event.market_data['user_bets'][i]['payout'] = payout
                    
                    # Also update any UserBet model instances linked to this event
                    try:
                        user_bet_instances = UserBet.objects.filter(
                            user_id=user_id,
                            league_event=event
                        )
                        for user_bet_instance in user_bet_instances:
                            user_bet_instance.result = result
                            user_bet_instance.save()
                            logger.info(f"Updated UserBet model instance for user {user_id}, result: {result}")
                    except Exception as ube:
                        logger.warning(f"Could not update UserBet model instances: {str(ube)}")
                    
                except Exception as e:
                    logger.error(f"Error processing bet for user {user_id}: {str(e)}")
        
        # Process results for all circuit bets
        if event.market_data and 'circuit_bets' in event.market_data:
            circuit_bets = event.market_data.get('circuit_bets', [])
            logger.info(f"Found {len(circuit_bets)} circuit bets in market_data")
            
            for i, circuit_bet in enumerate(circuit_bets):
                try:
                    # Get circuit bet details
                    user_id = circuit_bet.get('user_id')
                    circuit_id = circuit_bet.get('circuit_id')
                    choice = circuit_bet.get('outcome')
                    weight = int(circuit_bet.get('weight', 1))
                    
                    if not user_id or not circuit_id or not choice:
                        logger.warning(f"Incomplete circuit bet data: {circuit_bet}")
                        continue
                    
                    # Determine the result
                    result = 'lost'
                    points = 0
                    
                    # Check if the user bet matches the winning outcome
                    if choice.lower() == winner.lower():
                        result = 'won'
                        # Calculate points with weight
                        points = 1 * weight
                        
                        # Find circuit participant and update their score
                        try:
                            circuit = Circuit.objects.get(id=circuit_id)
                            participant = CircuitParticipant.objects.get(
                                circuit=circuit,
                                user_id=user_id
                            )
                            participant.score += points
                            participant.save()
                            logger.info(f"User {user_id} earned {points} points in circuit {circuit_id} for event {event.event_name}")
                            
                            # Create notification for the correct prediction
                            try:
                                user = User.objects.get(id=user_id)
                                Notification.objects.create(
                                    user=user,
                                    message=f"Your prediction for {event.event_name} in circuit {circuit.name} was correct! (+{points} points)",
                                    notification_type='info'
                                )
                                logger.info(f"Created win notification for user {user_id} in circuit {circuit_id}")
                            except User.DoesNotExist:
                                logger.warning(f"User with ID {user_id} not found for notification")
                        except (Circuit.DoesNotExist, CircuitParticipant.DoesNotExist) as e:
                            logger.warning(f"Could not update circuit participant score: {str(e)}")
                    else:
                        # Incorrect prediction - create notification
                        try:
                            user = User.objects.get(id=user_id)
                            circuit = Circuit.objects.get(id=circuit_id)
                            Notification.objects.create(
                                user=user,
                                message=f"Your prediction for {event.event_name} in circuit {circuit.name} was incorrect.",
                                notification_type='info'
                            )
                            logger.info(f"Created loss notification for user {user_id} in circuit {circuit_id}")
                        except (User.DoesNotExist, Circuit.DoesNotExist) as e:
                            logger.warning(f"Error creating notification: {str(e)}")
                    
                    # Update the circuit bet with the result
                    event.market_data['circuit_bets'][i]['result'] = result
                    event.market_data['circuit_bets'][i]['points'] = points
                    
                except Exception as e:
                    logger.error(f"Error processing circuit bet for user {user_id} in circuit {circuit_id}: {str(e)}")
        
        # Save the updated event
        event.save()
        
        return Response({
            'message': 'Event marked as completed successfully',
            'event': LeagueEventSerializer(event).data
        })
    except Exception as e:
        logger.error(f"Error completing league event: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_custom_event(request):
    """Create a custom event manually by a league captain."""
    try:
        # Extract request data
        league_id = request.data.get('league_id')
        event_name = request.data.get('event_name')
        sport = request.data.get('sport')
        home_team = request.data.get('home_team')
        away_team = request.data.get('away_team')
        commence_time = request.data.get('commence_time')
        end_time = request.data.get('end_time')
        market_data = request.data.get('market_data', {})
        
        # Validate required fields
        if not all([league_id, event_name, sport]):
            return Response({'error': 'Missing required fields'}, status=400)
        
        # Get the league
        try:
            league = League.objects.get(id=league_id)
        except League.DoesNotExist:
            return Response({'error': 'League not found'}, status=404)
            
        # Check if user is the league captain
        if request.user != league.captain:
            return Response({'error': 'Only league captains can create custom events'}, status=403)
            
        # Generate a unique event key since this is a custom event
        event_key = f"custom-{uuid.uuid4().hex[:8]}"
        
        # Create the league event
        league_event = LeagueEvent.objects.create(
            league=league,
            event_key=event_key,
            event_id=None,  # No Odds API ID for custom events
            event_name=event_name,
            sport=sport,
            commence_time=commence_time,
            home_team=home_team,
            away_team=away_team,
            market_data=market_data
        )
        
        # Serialize and return the created event
        serializer = LeagueEventSerializer(league_event)
        return Response({
            'message': 'Custom event successfully created',
            'event': serializer.data
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error creating custom event: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_league(request, league_id):
    """
    Update league details like name, description, and image.
    Only the league captain can make these changes.
    """
    try:
        league = League.objects.get(id=league_id)
        
        # Check if user is the captain
        if request.user != league.captain:
            return Response({'error': 'Only the league captain can update league details'}, status=403)
        
        # Handle FormData
        if request.FILES:
            if 'image' in request.FILES:
                league.image = request.FILES['image']
        
        # Handle JSON data
        if request.data:
            data = request.data
            if 'name' in data:
                league.name = data['name']
            if 'description' in data:
                league.description = data['description']
        
        # Save the changes
        league.save()
        
        # Return the updated league data
        serializer = LeagueSerializer(league)
        return Response(serializer.data)
        
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating league: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_league_chat_messages(request, league_id):
    """Get all chat messages for a specific league."""
    try:
        # Ensure the league exists
        league = League.objects.get(id=league_id)
        
        # Ensure user is a member of the league
        if request.user not in league.members.all():
            return Response({'error': 'You are not a member of this league'}, status=403)
            
        # Get all messages for this league
        messages = ChatMessage.objects.filter(league=league)
        
        # Serialize and return the messages
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching chat messages: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_chat_message(request, league_id):
    """Send a new chat message to a league."""
    try:
        # Ensure the league exists
        league = League.objects.get(id=league_id)
        
        # Ensure user is a member of the league
        if request.user not in league.members.all():
            return Response({'error': 'You are not a member of this league'}, status=403)
            
        # Create the message
        message = ChatMessage.objects.create(
            league=league,
            sender=request.user,
            message=request.data.get('message', '')
        )
        
        # Serialize and return the created message
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=201)
        
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        logger.error(f"Error sending chat message: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_league_member(request, league_id, user_id):
    """Remove a member from a league. Only the captain can remove members."""
    try:
        league = League.objects.get(id=league_id)
        user_to_remove = User.objects.get(id=user_id)
        
        # Check if the requesting user is the captain
        if request.user != league.captain:
            return Response({'error': 'Only the league captain can remove members'}, status=403)
            
        # Check if the user is actually a member
        if user_to_remove not in league.members.all():
            return Response({'error': 'User is not a member of this league'}, status=404)
            
        # Cannot remove the captain
        if user_to_remove == league.captain:
            return Response({'error': 'Cannot remove the league captain'}, status=400)
            
        # Remove the member
        league.members.remove(user_to_remove)
        
        return Response({'message': 'Member removed successfully'})
        
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Error removing league member: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_league_circuits(request, league_id):
    """Retrieve all circuits belonging to a specific league."""
    try:
        league = League.objects.get(pk=league_id)
        # Ensure the requesting user is a member of the league
        if not league.members.filter(id=request.user.id).exists():
            return Response({'error': 'User is not a member of this league'}, status=status.HTTP_403_FORBIDDEN)

        circuits = Circuit.objects.filter(league=league).order_by('-created_at')
        serializer = CircuitSerializer(circuits, many=True)
        return Response(serializer.data)

    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching circuits for league {league_id}: {e}")
        return Response({'error': 'An error occurred while fetching circuits'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateCircuitView(generics.CreateAPIView):
    """API endpoint for creating new Circuits within a League."""
    serializer_class = CircuitCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            league_id = self.kwargs.get('league_id')
            league = League.objects.get(pk=league_id)

            # Permission Check: Only league captain can create circuits
            if league.captain != self.request.user:
                # Although caught by get_queryset, double-check here for clarity
                raise serializers.ValidationError("Only the league captain can create circuits.")

            # Save the circuit, associating it with the league and captain
            serializer.save(league=league, captain=self.request.user)
        except League.DoesNotExist:
             raise serializers.ValidationError("League not found.")
        except Exception as e:
            logger.error(f"Error creating circuit in league {league_id}: {str(e)}")
            # Re-raise validation errors, otherwise raise a generic one
            if isinstance(e, serializers.ValidationError):
                raise e
            raise serializers.ValidationError("An unexpected error occurred while creating the circuit.")

    def create(self, request, *args, **kwargs):
        # Override create to provide better error handling/response
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            # Return the detailed circuit data using the read serializer
            circuit_instance = serializer.instance
            read_serializer = CircuitSerializer(circuit_instance)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except serializers.ValidationError as e:
            logger.warning(f"Circuit creation validation failed: {e.detail}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Catch unexpected errors from perform_create or elsewhere
            logger.error(f"Unexpected error during circuit creation: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetCircuitDetailView(generics.RetrieveAPIView):
    """API endpoint to retrieve details of a specific Circuit."""
    queryset = Circuit.objects.prefetch_related(
        'circuitcomponentevent_set__league_event', # Correct prefetch path through the intermediate model
        'participants__user' # Prefetch participant user data
    ).all()
    serializer_class = CircuitDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'circuit_id' # The name of the URL parameter for the circuit ID

    def get_object(self):
        # Ensure the user is a member of the league the circuit belongs to
        circuit = super().get_object()
        if not circuit.league.members.filter(id=self.request.user.id).exists():
            raise serializers.ValidationError("You are not a member of the league this circuit belongs to.")
        return circuit

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except serializers.ValidationError as e:
            # Handle permission errors raised in get_object
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Circuit.DoesNotExist:
            return Response({"error": "Circuit not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving circuit detail: {str(e)}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_circuit(request, circuit_id):
    user = request.user
    circuit = get_object_or_404(Circuit, id=circuit_id)

    # Check if the circuit is joinable
    if circuit.status != 'active':
        return Response({'error': 'Cannot join a circuit that has been completed.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user already joined
    if CircuitParticipant.objects.filter(circuit=circuit, user=user).exists():
        return Response({'error': 'You have already joined this circuit.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user has sufficient funds
    if user.money < circuit.entry_fee:
        return Response({'error': 'Insufficient funds to join this circuit.'}, status=status.HTTP_400_BAD_REQUEST)

    # Deduct entry fee
    user.money -= Decimal(str(circuit.entry_fee))
    user.save()

    # Create CircuitParticipant entry
    CircuitParticipant.objects.create(
        circuit=circuit,
        user=user,
        paid_entry=True
    )

    return Response({'message': 'Successfully joined the circuit!'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_circuit(request, circuit_id):
    user = request.user
    circuit = get_object_or_404(Circuit, id=circuit_id)

    # Ensure only the captain can complete the circuit
    if circuit.captain != user:
        return Response({'error': 'Only the league captain can complete the circuit.'}, status=status.HTTP_403_FORBIDDEN)

    # Ensure circuit is active or calculating
    if circuit.status not in ['active', 'calculating']:
        return Response({'error': 'Circuit cannot be completed in its current state.'}, status=status.HTTP_400_BAD_REQUEST)

    # Calculate final scores (assuming points are already updated after each event)
    participants = circuit.participants.all().order_by('-score')

    if not participants.exists():
        return Response({'error': 'No participants in this circuit.'}, status=status.HTTP_400_BAD_REQUEST)

    top_score = participants.first().score
    winners = participants.filter(score=top_score)

    if winners.count() > 1:
        circuit.status = 'calculating'
        circuit.save()
        return Response({'message': 'Circuit has a tie. Please resolve manually.'}, status=status.HTTP_200_OK)

    winner = winners.first().user
    circuit.winner = winner
    circuit.status = 'completed'
    circuit.save()

    # Transfer total entry fees to winner
    total_prize = circuit.entry_fee * participants.count()
    winner.money += Decimal(str(total_prize))
    winner.save()

    return Response({'message': f'Circuit completed successfully! Winner: {winner.username}', 'prize': str(total_prize)}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_circuit_event_bets(request, circuit_id, event_id):
    """Get all user bets for a specific event in a circuit."""
    try:
        # Ensure the circuit exists
        circuit = Circuit.objects.get(id=circuit_id)
        
        # Ensure the event is part of the circuit
        component_event = CircuitComponentEvent.objects.filter(
            circuit=circuit,
            league_event_id=event_id
        ).first()
        
        if not component_event:
            return Response({'error': 'Event not found in this circuit'}, status=404)
        
        # Get the league event
        league_event = component_event.league_event
        
        # Ensure the user is a participant in the circuit or is the captain
        is_participant = circuit.participants.filter(user=request.user).exists() or circuit.captain == request.user
        
        if not is_participant:
            return Response({'error': 'You are not a participant in this circuit'}, status=403)
        
        # Check if the event has user bets in its market_data
        user_bets = []
        if league_event.market_data and 'circuit_bets' in league_event.market_data:
            circuit_bets = league_event.market_data['circuit_bets']
            # Filter bets for this specific circuit
            user_bets = [bet for bet in circuit_bets if bet.get('circuit_id') == int(circuit_id)]
        
        return Response(user_bets)
        
    except Circuit.DoesNotExist:
        return Response({'error': 'Circuit not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching circuit event bets: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_circuit_with_tiebreaker(request, circuit_id, event_id):
    """
    Completes a circuit using a tiebreaker event to determine the winner.
    """
    # Get the circuit, tiebreaker event, and validate access
    circuit = get_object_or_404(Circuit, id=circuit_id)
    tiebreaker_event = get_object_or_404(LeagueEvent, id=event_id)
    
    # Ensure the user is authorized (captain of the league)
    if request.user.id != circuit.league.captain.id:
        return Response({"error": "Only the league captain can complete a circuit"}, status=status.HTTP_403_FORBIDDEN)

    # Check if circuit is already completed
    if circuit.status == 'completed':
        return Response({"error": "This circuit has already been completed"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure all events are completed
    incomplete_events = CircuitComponentEvent.objects.filter(circuit=circuit, league_event__completed=False).exclude(league_event=tiebreaker_event)
    if incomplete_events.exists():
        return Response({"error": "All events must be completed before finalizing the circuit"}, status=status.HTTP_400_BAD_REQUEST)

    # Get the tiebreaker value from the request
    if 'tiebreaker_value' not in request.data:
        return Response({"error": "Tiebreaker value is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    tiebreaker_value = request.data.get('tiebreaker_value')
    
    print(f"[TIEBREAKER] Starting circuit completion with tiebreaker. Circuit: {circuit_id}, Event: {event_id}, Value: {tiebreaker_value}")
    
    # Complete the tiebreaker event if it's not already completed
    if not tiebreaker_event.completed:
        print(f"[TIEBREAKER] Tiebreaker event not completed yet, completing it now with value: {tiebreaker_value}")
        # Set the correct outcome in market_data
        market_data = tiebreaker_event.market_data or {}
        market_data['winner'] = tiebreaker_value
        tiebreaker_event.market_data = market_data
        tiebreaker_event.completed = True
        tiebreaker_event.save()
    else:
        print(f"[TIEBREAKER] Tiebreaker event already completed, using existing value: {tiebreaker_event.market_data.get('winner', 'N/A')}")

    # Find participants with the highest score
    participants = CircuitParticipant.objects.filter(circuit=circuit).order_by('-score')
    
    if not participants.exists():
        return Response({"error": "No participants found in this circuit"}, status=status.HTTP_400_BAD_REQUEST)
    
    highest_score = participants.first().score
    tied_participants = participants.filter(score=highest_score)
    
    print(f"[TIEBREAKER] Found {tied_participants.count()} participants tied with highest score {highest_score}")
    for p in tied_participants:
        print(f"[TIEBREAKER] Tied participant: {p.user.username} with score {p.score}")
    
    # Determine the winner(s) based on the tiebreaker
    if tied_participants.count() == 1:
        # Only one participant with the highest score, no tiebreaker needed
        print(f"[TIEBREAKER] Only one participant with highest score: {tied_participants.first().user.username}. No tiebreaker needed.")
        winners = tied_participants
    else:
        # Multiple participants tied for the highest score
        print(f"[TIEBREAKER] Multiple participants tied, resolving with tiebreaker")
        
        # Check if there are any UserBet records for the tiebreaker event
        tiebreaker_bets = UserBet.objects.filter(
            user__in=[p.user.id for p in tied_participants],
            league_event=tiebreaker_event
        )
        
        print(f"[TIEBREAKER] Found {tiebreaker_bets.count()} tiebreaker bets")
        
        if tiebreaker_bets.exists():
            print(f"[TIEBREAKER] Using existing tiebreaker bets to determine winner")
            for bet in tiebreaker_bets:
                print(f"[TIEBREAKER] Bet from {bet.user.username}: {bet.choice}")
            
            # Determine the winner based on the closest guess to the tiebreaker value
            try:
                # Try to parse the tiebreaker value as a number
                tiebreaker_numeric = float(tiebreaker_value)
                print(f"[TIEBREAKER] Tiebreaker value is numeric: {tiebreaker_numeric}")
                
                # Calculate the distances for each participant's bet
                bet_distances = {}
                for bet in tiebreaker_bets:
                    try:
                        print(f"[TIEBREAKER] Processing bet for {bet.user.username}: choice='{bet.choice}', numeric_choice={bet.numeric_choice}")
                        
                        # Prioritize numeric_choice if available, otherwise try to convert choice
                        if bet.numeric_choice is not None:
                            bet_value = float(bet.numeric_choice)
                            print(f"[TIEBREAKER] Using numeric_choice: {bet_value}")
                        elif bet.choice and bet.choice.strip():
                            bet_value = float(bet.choice)
                            print(f"[TIEBREAKER] Converting choice to number: {bet_value}")
                        else:
                            raise ValueError("No valid numeric value in bet")
                            
                        distance = abs(bet_value - tiebreaker_numeric)
                        bet_distances[bet.user.id] = distance
                        print(f"[TIEBREAKER] User {bet.user.username} (ID: {bet.user.id}) bet {bet_value}, distance: {distance}")
                    except (ValueError, TypeError) as e:
                        # If the bet value can't be converted to a number, use a large distance
                        bet_distances[bet.user.id] = float('inf')
                        print(f"[TIEBREAKER] User {bet.user.username} bet has invalid numeric value: {e}. Setting distance to infinity")
                
                if bet_distances:
                    # Find the minimum distance
                    min_distance = min(bet_distances.values())
                    print(f"[TIEBREAKER] Minimum distance found: {min_distance}")
                    
                    # Get all users with the minimum distance
                    closest_users = [user_id for user_id, distance in bet_distances.items() if distance == min_distance]
                    print(f"[TIEBREAKER] Users with closest guess: {len(closest_users)}")
                    for user_id in closest_users:
                        user = User.objects.get(id=user_id)
                        print(f"[TIEBREAKER] Closest user: {user.username}")
                    
                    # Filter participants to only include those with the closest tiebreaker guess
                    winners = tied_participants.filter(user__id__in=closest_users)
                else:
                    print(f"[TIEBREAKER] No valid numeric bets found, keeping all tied participants as winners")
                    winners = tied_participants
            except (ValueError, TypeError):
                # If tiebreaker value is not a number, use string comparison
                print(f"[TIEBREAKER] Tiebreaker value is not numeric: {tiebreaker_value}. Using string comparison.")
                
                # For non-numeric tiebreakers, exact matches win
                exact_matches = [bet.user.id for bet in tiebreaker_bets if bet.choice == tiebreaker_value]
                
                if exact_matches:
                    print(f"[TIEBREAKER] Found {len(exact_matches)} users with exact match.")
                    for user_id in exact_matches:
                        user = User.objects.get(id=user_id)
                        print(f"[TIEBREAKER] Exact match user: {user.username}")
                    
                    winners = tied_participants.filter(user__id__in=exact_matches)
                else:
                    print(f"[TIEBREAKER] No exact matches found, keeping all tied participants as winners")
                    winners = tied_participants
        else:
            # No UserBet records found for the tiebreaker event
            print(f"[TIEBREAKER] No existing tiebreaker bets found. Looking for UserBet records for the tied participants.")
            
            # If no bets for tiebreaker event, look for UserBet records for the tied participants
            all_user_bets = UserBet.objects.filter(
                user__in=[p.user.id for p in tied_participants],
                league_event=tiebreaker_event
            )
            
            print(f"[TIEBREAKER] Found {all_user_bets.count()} user bets for the tiebreaker event")
            
            if all_user_bets.exists():
                print(f"[TIEBREAKER] Using user bets to determine winner")
                
                try:
                    # Try to parse the tiebreaker value as a number
                    tiebreaker_numeric = float(tiebreaker_value)
                    print(f"[TIEBREAKER] Tiebreaker value is numeric: {tiebreaker_numeric}")
                    
                    # Calculate the distances for each participant's bet
                    bet_distances = {}
                    for bet in all_user_bets:
                        try:
                            print(f"[TIEBREAKER] Processing bet for {bet.user.username}: choice='{bet.choice}', numeric_choice={bet.numeric_choice}")
                            
                            # Prioritize numeric_choice if available, otherwise try to convert choice
                            if bet.numeric_choice is not None:
                                bet_value = float(bet.numeric_choice)
                                print(f"[TIEBREAKER] Using numeric_choice: {bet_value}")
                            elif bet.choice and bet.choice.strip():
                                bet_value = float(bet.choice)
                                print(f"[TIEBREAKER] Converting choice to number: {bet_value}")
                            else:
                                raise ValueError("No valid numeric value in bet")
                                
                            distance = abs(bet_value - tiebreaker_numeric)
                            bet_distances[bet.user.id] = distance
                            print(f"[TIEBREAKER] User {bet.user.username} (ID: {bet.user.id}) bet {bet_value}, distance: {distance}")
                        except (ValueError, TypeError) as e:
                            # If the bet value can't be converted to a number, use a large distance
                            bet_distances[bet.user.id] = float('inf')
                            print(f"[TIEBREAKER] User {bet.user.username} bet has invalid numeric value: {e}. Setting distance to infinity")
                    
                    if bet_distances:
                        # Find the minimum distance
                        min_distance = min(bet_distances.values())
                        print(f"[TIEBREAKER] Minimum distance found: {min_distance}")
                        
                        # Get all users with the minimum distance
                        closest_users = [user_id for user_id, distance in bet_distances.items() if distance == min_distance]
                        print(f"[TIEBREAKER] Users with closest guess: {closest_users}")
                        for user_id in closest_users:
                            try:
                                user = User.objects.get(id=user_id)
                                print(f"[TIEBREAKER] Closest user: {user.username} (ID: {user_id})")
                            except User.DoesNotExist:
                                print(f"[TIEBREAKER] User with ID {user_id} not found")
                        
                        # Filter participants to only include those with the closest tiebreaker guess
                        winners = tied_participants.filter(user__id__in=closest_users)
                        print(f"[TIEBREAKER] Winners after filtering for closest guess: {winners.count()}")
                        for winner in winners:
                            print(f"[TIEBREAKER] Winner: {winner.user.username} (ID: {winner.user.id})")
                    else:
                        print(f"[TIEBREAKER] No valid numeric bets found, keeping all tied participants as winners")
                        winners = tied_participants
                except (ValueError, TypeError):
                    # If tiebreaker value is not a number, use string comparison
                    print(f"[TIEBREAKER] Tiebreaker value is not numeric: {tiebreaker_value}. Using string comparison.")
                    
                    # For non-numeric tiebreakers, exact matches win
                    exact_matches = [bet.user.id for bet in all_user_bets if bet.choice == tiebreaker_value]
                    
                    if exact_matches:
                        print(f"[TIEBREAKER] Found {len(exact_matches)} users with exact match.")
                        for user_id in exact_matches:
                            user = User.objects.get(id=user_id)
                            print(f"[TIEBREAKER] Exact match user: {user.username}")
                        
                        winners = tied_participants.filter(user__id__in=exact_matches)
                    else:
                        print(f"[TIEBREAKER] No exact matches found, keeping all tied participants as winners")
                        winners = tied_participants
            else:
                print(f"[TIEBREAKER] No bets found for tied participants and tiebreaker event, keeping all tied participants as winners")
                winners = tied_participants

    # Calculate the prize amount
    total_participants = participants.count()
    total_prize = circuit.entry_fee * total_participants
    
    print(f"[TIEBREAKER] Total prize pool: {total_prize}")
    print(f"[TIEBREAKER] Number of winners: {winners.count()}")
    
    # If there's only one winner, they get the full prize
    if winners.count() == 1:
        winner = winners.first()
        prize_per_winner = total_prize
        print(f"[TIEBREAKER] Single winner: {winner.user.username} gets full prize: {prize_per_winner}")
        
        # Update winner's money balance
        winner.user.money = winner.user.money + Decimal(str(prize_per_winner))
        winner.user.save()
        print(f"[TIEBREAKER] Added {prize_per_winner} to {winner.user.username}'s account balance")
        
        # Create notification for the winner
        Notification.objects.create(
            user=winner.user,
            message=f"Congratulations! You won circuit '{circuit.name}' with {winner.score} points and earned ${prize_per_winner}!",
            notification_type='info'
        )
        print(f"[TIEBREAKER] Created win notification for {winner.user.username}")
    else:
        # Otherwise, split the prize equally
        prize_per_winner = total_prize / winners.count()
        print(f"[TIEBREAKER] Multiple winners, each gets: {prize_per_winner}")
        
        # Update each winner's money balance and create notification
        for winner in winners:
            # Update winner's money balance
            winner.user.money = winner.user.money + Decimal(str(prize_per_winner))
            winner.user.save()
            print(f"[TIEBREAKER] Added {prize_per_winner} to {winner.user.username}'s account balance")
            
            # Create notification
            Notification.objects.create(
                user=winner.user,
                message=f"Congratulations! You tied for 1st place in circuit '{circuit.name}' with {winner.score} points and earned ${prize_per_winner}!",
                notification_type='info'
            )
            print(f"[TIEBREAKER] Created win notification for {winner.user.username}")
    
    winner_data = []
    
    # Award the prize to the winner(s)
    for winner in winners:
        winner.prize_amount = prize_per_winner
        winner.save()
        
        # Add winner data for the response
        winner_data.append({
            'id': winner.user.id,
            'username': winner.user.username,
            'score': winner.score,
            'prize': prize_per_winner
        })
        
        print(f"[TIEBREAKER] Prize of {prize_per_winner} awarded to {winner.user.username}")
    
    # Complete the circuit
    circuit.status = 'completed'
    circuit.save()
    
    print(f"[TIEBREAKER] Circuit {circuit_id} marked as completed")
    
    # Return the winners and prize information
    return Response({
        'message': 'Circuit completed successfully',
        'circuit_id': circuit.id,
        'circuit_name': circuit.name,
        'total_prize': total_prize,
        'prize_per_winner': prize_per_winner,
        'winners': winner_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_circuit_completed_bets(request, circuit_id):
    """
    Return the list of event IDs that the current user has already placed bets on
    in a specific circuit.
    """
    try:
        # Get the circuit
        circuit = get_object_or_404(Circuit, id=circuit_id)
        
        # Check if user is a participant
        try:
            participant = CircuitParticipant.objects.get(circuit=circuit, user=request.user)
        except CircuitParticipant.DoesNotExist:
            return Response(
                {"error": "You are not a participant in this circuit"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the completed bets
        completed_event_ids = list(participant.completed_bets.values_list('id', flat=True))
        
        # Return the list of event IDs
        return Response(completed_event_ids, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_circuit_event(request, circuit_id, event_id):
    """
    Complete a specific event within a circuit by setting the winning outcome.
    Only the circuit captain can complete events.
    """
    try:
        # Get the circuit
        circuit = get_object_or_404(Circuit, id=circuit_id)
        
        # Check if user is the captain
        if request.user != circuit.captain:
            return Response(
                {"error": "Only the circuit captain can complete events"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if circuit is already completed
        if circuit.status == 'completed':
            return Response(
                {"error": "This circuit has already been completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the event
        event = get_object_or_404(LeagueEvent, id=event_id)
        
        # Check if event belongs to this circuit
        try:
            component_event = CircuitComponentEvent.objects.get(circuit=circuit, league_event=event)
        except CircuitComponentEvent.DoesNotExist:
            return Response(
                {"error": "This event is not part of the specified circuit"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is already completed
        if event.completed:
            return Response(
                {"error": "This event has already been completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the winning outcome from request data
        winning_outcome = request.data.get('winning_outcome')
        if not winning_outcome:
            return Response(
                {"error": "Winning outcome is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Log the winning outcome for debugging
        logger.info(f"Completing circuit event {event_id} with winning outcome: '{winning_outcome}'")
        
        # For tiebreaker events with numeric predictions
        correct_numeric_value = None
        if event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique']:
            try:
                correct_numeric_value = float(request.data.get('numeric_value'))
                event.tiebreaker_correct_value = correct_numeric_value
            except (ValueError, TypeError):
                return Response(
                    {"error": "Valid numeric value is required for tiebreaker events"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Mark the event as completed
        event.completed = True
        if event.market_data is None:
            event.market_data = {}
        
        # Update market data with winning outcome
        event.market_data['winner'] = winning_outcome
        if correct_numeric_value is not None:
            event.market_data['correct_numeric_value'] = correct_numeric_value
        
        event.save()
        
        # Initialize circuit_bets in market_data if it doesn't exist
        if 'circuit_bets' not in event.market_data:
            event.market_data['circuit_bets'] = []
        
        all_circuit_bets = event.market_data.get('circuit_bets', [])
        this_circuit_bets = [bet for bet in all_circuit_bets if bet.get('circuit_id') == int(circuit_id)]
        
        # Track participants with correct predictions
        updated_participants = []
        participant_updates = {}
        
        # Fetch all UserBet models for this event to avoid repeated queries
        all_user_bets = {bet.user_id: bet for bet in UserBet.objects.filter(league_event=event)}
        logger.info(f"Found {len(all_user_bets)} user bets for event {event_id}")
        
        # Calculate points for each participant who bet on this event
        for participant in circuit.participants.all():
            logger.info(f"Processing participant: {participant.user.username} (ID: {participant.user.id})")
            
            # Find bet in the UserBet model
            user_bet = all_user_bets.get(participant.user.id)
            if user_bet:
                logger.info(f"Found UserBet for {participant.user.username}: choice='{user_bet.choice}', result={user_bet.result}")
                
                # For tiebreaker events with numeric values
                if event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique'] and correct_numeric_value is not None:
                    # Store numeric choice for tiebreaker resolution later
                    user_bet.result = 'pending_tiebreaker'
                    user_bet.save()
                    
                    # Add to circuit_bets for tracking if not already there
                    if not any(bet.get('user_id') == participant.user.id for bet in this_circuit_bets):
                        new_bet = {
                            'user_id': participant.user.id,
                            'circuit_id': int(circuit_id),
                            'outcome': str(user_bet.numeric_choice) if user_bet.numeric_choice is not None else user_bet.choice,
                            'weight': component_event.weight,
                            'result': 'pending_tiebreaker'
                        }
                        all_circuit_bets.append(new_bet)
                else:
                    # Ensure clean string comparison by trimming whitespace
                    user_prediction = user_bet.choice.strip() if user_bet.choice else ""
                    winning_outcome_clean = winning_outcome.strip() if winning_outcome else ""
                    
                    # Case-insensitive comparison for text-based choices
                    is_correct = user_prediction.lower() == winning_outcome_clean.lower()
                    
                    if is_correct:
                        # Correct prediction
                        logger.info(f"Correct prediction for {participant.user.username}! '{user_prediction}' matches '{winning_outcome_clean}'")
                        # Calculate points based on event weight
                        points_earned = component_event.weight
                        participant.score += points_earned
                        
                        # Update UserBet model
                        user_bet.result = 'won'
                        user_bet.points_earned = points_earned
                        user_bet.save()
                        
                        # Track for UI updates
                        participant_updates[participant.user.id] = {
                            'points': points_earned,
                            'username': participant.user.username
                        }
                        
                        # Add to circuit_bets for tracking if not already there
                        if not any(bet.get('user_id') == participant.user.id for bet in this_circuit_bets):
                            new_bet = {
                                'user_id': participant.user.id,
                                'circuit_id': int(circuit_id),
                                'outcome': user_prediction,
                                'weight': component_event.weight,
                                'result': 'won',
                                'points_earned': points_earned
                            }
                            all_circuit_bets.append(new_bet)
                    else:
                        # Incorrect prediction
                        logger.info(f"Incorrect prediction for {participant.user.username}. '{user_prediction}' does not match '{winning_outcome_clean}'")
                        user_bet.result = 'lost'
                        user_bet.points_earned = 0
                        user_bet.save()
                        
                        # Add to circuit_bets for tracking if not already there
                        if not any(bet.get('user_id') == participant.user.id for bet in this_circuit_bets):
                            new_bet = {
                                'user_id': participant.user.id,
                                'circuit_id': int(circuit_id),
                                'outcome': user_prediction,
                                'weight': component_event.weight,
                                'result': 'lost',
                                'points_earned': 0
                            }
                            all_circuit_bets.append(new_bet)
                
                participant.save()
                updated_participants.append(participant.id)
            else:
                # Also check in market_data circuit_bets if no UserBet found
                matching_bets = [bet for bet in this_circuit_bets if bet.get('user_id') == participant.user.id]
                if matching_bets:
                    logger.info(f"Found circuit_bet in market_data for {participant.user.username}")
                    bet = matching_bets[0]
                    
                    # Process bet similarly to UserBet
                    if event.betting_type in ['tiebreaker_closest', 'tiebreaker_unique'] and correct_numeric_value is not None:
                        bet['result'] = 'pending_tiebreaker'
                    else:
                        user_prediction = bet.get('outcome', '').strip()
                        winning_outcome_clean = winning_outcome.strip()
                        
                        is_correct = user_prediction.lower() == winning_outcome_clean.lower()
                        
                        if is_correct:
                            points_earned = component_event.weight
                            participant.score += points_earned
                            bet['result'] = 'won'
                            bet['points_earned'] = points_earned
                            
                            participant_updates[participant.user.id] = {
                                'points': points_earned,
                                'username': participant.user.username
                            }
                        else:
                            bet['result'] = 'lost'
                            bet['points_earned'] = 0
                    
                    participant.save()
                    updated_participants.append(participant.id)
        
        # Update the circuit_bets in market_data
        event.market_data['circuit_bets'] = all_circuit_bets
        event.save()
        
        # Add notifications for users who earned points
        for user_id, update in participant_updates.items():
            try:
                user = User.objects.get(id=user_id)
                Notification.objects.create(
                    user=user,
                    message=f"Your prediction for {event.event_name} in circuit {circuit.name} was correct! (+{update['points']} points)",
                    notification_type='info'
                )
                logger.info(f"Created win notification for user {user.username} in circuit {circuit.name}")
            except User.DoesNotExist:
                logger.warning(f"User with ID {user_id} not found for notification")
        
        # Fetch updated circuit data for response
        updated_circuit = Circuit.objects.get(id=circuit_id)
        serializer = CircuitDetailSerializer(updated_circuit)
        
        # Include information about completed event and participant updates
        response_data = dict(serializer.data)  # Convert to regular dict to ensure mutability
        
        # Add completed event info to response
        response_data['completed_event'] = {
            'id': event.id,
            'name': event.event_name,
            'winning_outcome': winning_outcome,
            'numeric_value': correct_numeric_value,
            'weight': component_event.weight
        }
        
        # Ensure participant_updates is included in the response
        logger.info(f"Adding participant updates to response: {participant_updates}")
        response_data['participant_updates'] = participant_updates
        
        # Log the final response structure to confirm participant_updates is included
        logger.info(f"Response keys: {response_data.keys()}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error completing circuit event: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )