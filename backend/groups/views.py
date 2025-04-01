from django.shortcuts import render
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics, status
from .models import League, Bet, UserBet, LeagueInvite, LeagueEvent
from users.models import User, Notification, FriendRequest
from .serializers import LeagueSerializer, BetSerializer, LeagueEventSerializer
import logging
import json
import requests
import uuid
from decimal import Decimal
from django.utils import timezone
from .odds import OddsApiClient

logger = logging.getLogger(__name__)

class CreateLeagueView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeagueSerializer

    def perform_create(self, serializer):
        # Create league with current user as captain
        league = serializer.save(captain=self.request.user)
        # Add captain as first member
        league.members.add(self.request.user)
        return league

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
    """Mark a league event as completed and process bet outcomes."""
    try:
        # Get the event
        event = LeagueEvent.objects.get(id=event_id)
        
        # Verify the user is the league captain
        if request.user != event.league.captain:
            return Response({'error': 'Only the league captain can complete events'}, status=403)
        
        # Check if event is already completed
        if event.completed:
            return Response({'error': 'This event is already completed'}, status=400)
        
        # Get request data
        data = request.data
        winning_outcome = data.get('winning_outcome')
        
        if not winning_outcome:
            return Response({'error': 'Winning outcome is required'}, status=400)
        
        # Mark the event as completed
        event.completed = True
        event.save()
        
        # Log for debugging
        logger.info(f"Completing event {event.id}: {event.event_name}")
        logger.info(f"Winning outcome: {winning_outcome}")
        logger.info(f"Market data: {event.market_data}")
        
        # Check if we have market_data with user bets
        if event.market_data and isinstance(event.market_data, dict):
            # Process user bets directly from market_data if available
            user_bets = event.market_data.get('user_bets', [])
            logger.info(f"Found {len(user_bets)} user bets in market_data")
            
            for user_bet in user_bets:
                try:
                    # Get user and bet details
                    user_id = user_bet.get('user_id')
                    choice = user_bet.get('outcomeKey')
                    amount = float(user_bet.get('amount', 0))
                    odds = float(user_bet.get('odds', 2.0))
                    
                    if not user_id or not choice or amount <= 0:
                        logger.warning(f"Incomplete bet data: {user_bet}")
                        continue
                    
                    # Get the user
                    try:
                        user = User.objects.get(id=user_id)
                    except User.DoesNotExist:
                        logger.warning(f"User with ID {user_id} not found")
                        continue
                    
                    # Check if the user won or lost
                    if choice == winning_outcome:
                        # User won - calculate winnings based on odds and amount wagered
                        winnings = amount * odds
                        
                        # Update user's money
                        user.money += Decimal(str(winnings))
                        
                        # Award 1 point for winning
                        user.points += 1
                        user.save()
                        
                        # Create notification for the win
                        logger.info(f"Creating win notification for user {user.username}")
                        notification = Notification.objects.create(
                            user=user,
                            message=f"You won ${winnings:.2f} on {event.event_name}!",
                            notification_type='info'
                        )
                        logger.info(f"Created notification ID {notification.id} for {user.username}")
                    else:
                        # User lost
                        logger.info(f"Creating loss notification for user {user.username}")
                        notification = Notification.objects.create(
                            user=user,
                            message=f"You lost your bet of ${amount:.2f} on {event.event_name}",
                            notification_type='info'
                        )
                        logger.info(f"Created notification ID {notification.id} for {user.username}")
                        user.save()  # Save the user to ensure any other changes are persisted
                        
                except Exception as bet_error:
                    logger.error(f"Error processing bet: {str(bet_error)}", exc_info=True)
        
        # Traditional bet processing (keeping this as a fallback)
        bets = Bet.objects.filter(name=event.event_key, league=event.league)
        logger.info(f"Found {bets.count()} traditional Bet objects")
        
        for bet in bets:
            # Mark bet as settled
            bet.status = 'settled'
            bet.save()
            
            # Get all user bets for this bet
            user_bets = UserBet.objects.filter(bet=bet)
            
            for user_bet in user_bets:
                # Check if the user won or lost
                if user_bet.choice == winning_outcome:
                    # User won - calculate winnings based on odds and amount wagered
                    odds = float(event.market_data.get('odds', 2.0))
                    winnings = user_bet.points_wagered * odds
                    
                    # Update user's result and money
                    user_bet.result = 'won'
                    user_bet.user.money += Decimal(str(winnings))
                    
                    # Award 1 point for winning
                    user_bet.user.points += 1
                    user_bet.user.save()
                    
                    # Create notification for the win
                    notification = Notification.objects.create(
                        user=user_bet.user,
                        message=f"You won ${winnings:.2f} on {event.event_name}!",
                        notification_type='info'
                    )
                    logger.info(f"Created traditional notification ID {notification.id} for {user_bet.user.username}")
                else:
                    # User lost
                    user_bet.result = 'lost'
                    
                    # Create notification for the loss
                    notification = Notification.objects.create(
                        user=user_bet.user,
                        message=f"You lost your bet of ${user_bet.points_wagered:.2f} on {event.event_name}",
                        notification_type='info'
                    )
                    logger.info(f"Created traditional notification ID {notification.id} for {user_bet.user.username}")
                
                # Save the updated user bet
                user_bet.save()
        
        # Log summary
        logger.info(f"Event {event.id} completion finished successfully")
        
        return Response({
            'message': 'Event marked as completed and bets settled',
            'event_id': event.id
        })
    except LeagueEvent.DoesNotExist:
        return Response({'error': 'League event not found'}, status=404)
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
    Update league details like name and description.
    Only the league captain can make these changes.
    """
    try:
        league = League.objects.get(id=league_id)
        
        # Check if user is the captain
        if request.user != league.captain:
            return Response({'error': 'Only the league captain can update league details'}, status=403)
        
        data = request.data
        
        # Update name and description if provided
        if 'name' in data:
            league.name = data['name']
        if 'description' in data:
            league.description = data['description']
        
        league.save()
        
        return Response(LeagueSerializer(league).data)
    except League.DoesNotExist:
        return Response({'error': 'League not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)