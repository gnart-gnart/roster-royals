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
    """API endpoint to post a betting event to a league."""
    try:
        # Get data from request
        league_id = request.data.get('league_id')
        event_key = request.data.get('event_key')
        event_id = request.data.get('event_id')  # ID from Odds API
        event_name = request.data.get('event_name')
        sport = request.data.get('sport')
        commence_time = request.data.get('commence_time')
        home_team = request.data.get('home_team')
        away_team = request.data.get('away_team')
        market_data = request.data.get('market_data', {})
        
        # Log for debugging
        logger.info(f"Posting league event: {event_name}")
        logger.info(f"User: {request.user.username} (ID: {request.user.id})")
        logger.info(f"Market data: {market_data}")
        
        # Validate required fields
        if not all([league_id, event_key, event_name, sport]):
            return Response({'error': 'Missing required fields'}, status=400)
        
        # Get the league
        try:
            league = League.objects.get(id=league_id)
        except League.DoesNotExist:
            return Response({'error': 'League not found'}, status=404)
            
        # Check if user is a member of the league or is captain
        if not (request.user in league.members.all() or request.user == league.captain):
            return Response({'error': 'You are not authorized to post events to this league'}, status=403)
        
        # Check if this event already exists in this league
        existing_event = LeagueEvent.objects.filter(league=league, event_key=event_key).first()
        if existing_event:
            logger.info(f"Event {event_key} already exists in league {league_id}")
            
            # Check if the user has already bet on this event
            if existing_event.market_data and 'user_bets' in existing_event.market_data:
                user_bets = existing_event.market_data['user_bets']
                if any(bet.get('user_id') == request.user.id for bet in user_bets):
                    return Response({'error': 'You have already placed a bet on this event'}, status=400)
            
            # If we're here, the event exists but the user hasn't bet on it yet
            # We'll add the user's bet to the existing event
            wager_amount = 0
            if market_data and 'amount' in market_data:
                wager_amount = float(market_data['amount'])
                if request.user.money < wager_amount:
                    return Response({'error': 'Insufficient funds to place this bet'}, status=400)
            
            # Add user bet to existing event
            if wager_amount > 0:
                # Deduct money from user
                request.user.money -= Decimal(str(wager_amount))
                request.user.save()
                
                # Prepare user bet data
                user_bet = {
                    'user_id': request.user.id,
                    'username': request.user.username,
                    'amount': wager_amount,
                    'odds': market_data.get('odds', 2.0),
                    'outcomeKey': market_data.get('outcomeKey', 'home'),
                    'bet_time': timezone.now().isoformat()
                }
                
                # Update the event's market_data
                if 'user_bets' not in existing_event.market_data:
                    existing_event.market_data['user_bets'] = []
                
                existing_event.market_data['user_bets'].append(user_bet)
                existing_event.save()
                
                logger.info(f"Added user bet to existing event: {user_bet}")
                
                return Response({
                    'message': 'Bet placed on existing event',
                    'betId': existing_event.id,
                    'event': LeagueEventSerializer(existing_event).data
                }, status=200)
        
        # Check if the user has sufficient funds if market_data includes a wager amount
        wager_amount = 0
        if market_data and 'amount' in market_data:
            wager_amount = float(market_data['amount'])
            if request.user.money < wager_amount:
                return Response({'error': 'Insufficient funds to place this bet'}, status=400)
        
        # Prepare market data with user bet information
        enhanced_market_data = market_data.copy() if market_data else {}
        
        # Add user_bets array if it doesn't exist
        if 'user_bets' not in enhanced_market_data:
            enhanced_market_data['user_bets'] = []
        
        # Add this user's bet if they're placing one
        if wager_amount > 0:
            user_bet = {
                'user_id': request.user.id,
                'username': request.user.username,
                'amount': wager_amount,
                'odds': market_data.get('odds', 2.0),
                'outcomeKey': market_data.get('outcomeKey', 'home'),
                'bet_time': timezone.now().isoformat()
            }
            enhanced_market_data['user_bets'].append(user_bet)
            
            logger.info(f"Created user bet data: {user_bet}")
            
        # Create the league event
        league_event = LeagueEvent.objects.create(
            league=league,
            event_key=event_key,
            event_id=event_id,
            event_name=event_name,
            sport=sport,
            commence_time=commence_time,
            home_team=home_team,
            away_team=away_team,
            market_data=enhanced_market_data
        )
        
        # If there's a wager, deduct money from the user
        if wager_amount > 0:
            request.user.money -= Decimal(str(wager_amount))
            request.user.save()
        
        # Serialize and return the created event
        serializer = LeagueEventSerializer(league_event)
        return Response({
            'message': 'Event successfully posted to league',
            'betId': league_event.id,
            'event': serializer.data
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error posting league event: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)

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
    if circuit.status != 'upcoming':
        return Response({'error': 'Cannot join a circuit that has already started or completed.'}, status=status.HTTP_400_BAD_REQUEST)

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