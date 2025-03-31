from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import League, User, LeagueInvite, Bet, UserBet, LeagueEvent
from users.models import Notification  # Import from users app instead
from .serializers import LeagueSerializer, LeagueEventSerializer
from .odds import OddsApiClient
import datetime
import logging
import requests

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
        event_name = request.data.get('event_name')
        sport = request.data.get('sport')
        market_data = request.data.get('market_data')
        
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
            
        # Create the league event
        league_event = LeagueEvent.objects.create(
            league=league,
            event_key=event_key,
            event_name=event_name,
            sport=sport,
            market_data=market_data
        )
        
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