from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer, UserRegistrationSerializer
from .models import User, FriendRequest, Notification, Friendship
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from groups.models import LeagueEvent, UserBet  # Add this import

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, user_id):
    try:
        to_user = User.objects.get(id=user_id)
        
        # Prevent self-friend requests
        if request.user.id == user_id:
            return Response(
                {'error': 'Cannot send friend request to yourself'}, 
                status=400
            )
        
        # Check if request already exists
        existing_request = FriendRequest.objects.filter(
            from_user=request.user,
            to_user=to_user
        ).first()
        
        if existing_request:
            if existing_request.status == 'pending':
                return Response(
                    {'error': 'Friend request already sent'}, 
                    status=400
                )
            elif existing_request.status == 'accepted':
                return Response(
                    {'error': 'Already friends'}, 
                    status=400
                )
            else:  # If rejected, allow new request
                existing_request.delete()
        
        # Check if they're already friends
        if request.user.friends.filter(id=user_id).exists():
            return Response(
                {'error': 'Already friends'}, 
                status=400
            )
            
        # Create the friend request
        FriendRequest.objects.create(
            from_user=request.user,
            to_user=to_user,
            status='pending'
        )
        return Response({'message': 'Friend request sent'})
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        print(f"Error in send_friend_request: {str(e)}")  # For debugging
        return Response(
            {'error': 'Failed to send friend request'}, 
            status=500
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    received_requests = FriendRequest.objects.filter(
        to_user=request.user,
        status='pending'
    )
    return Response({
        'requests': [
            {
                'id': req.id,
                'from_user': UserSerializer(req.from_user).data,
                'created_at': req.created_at
            } for req in received_requests
        ]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_friend_request(request, request_id):
    try:
        friend_request = FriendRequest.objects.get(
            id=request_id,
            to_user=request.user,
            status='pending'
        )
        action = request.data.get('action')
        
        if action == 'accept':
            # Update request status
            friend_request.status = 'accepted'
            friend_request.save()
            
            # Create friendship records in both directions
            Friendship.objects.create(user=request.user, friend=friend_request.from_user)
            Friendship.objects.create(user=friend_request.from_user, friend=request.user)
            
            # Create notification for sender
            Notification.objects.create(
                user=friend_request.from_user,
                message=f"{request.user.username} accepted your friend request",
                notification_type='friend_accepted'
            )
            
            return Response({'message': 'Friend request accepted'})
            
        elif action == 'reject':
            friend_request.status = 'rejected'
            friend_request.save()
            return Response({'message': 'Friend request rejected'})
            
    except FriendRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    # Get friends through the Friendship model
    friendships = Friendship.objects.filter(user=request.user)
    friends = [friendship.friend for friendship in friendships]
    return Response(UserSerializer(friends, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response([])
    
    current_user = request.user
    users = User.objects.filter(username__icontains=query)\
        .exclude(id=current_user.id)\
        .exclude(is_staff=True)\
        .exclude(is_superuser=True)
    
    results = []
    for user in users[:10]:  # Limit to 10 results
        # Check friendship status
        is_friend = current_user.friends.filter(id=user.id).exists()
        pending_request = FriendRequest.objects.filter(
            from_user=current_user,
            to_user=user,
            status='pending'
        ).exists()
        
        results.append({
            'id': user.id,
            'username': user.username,
            'points': user.points,
            'friendStatus': 'friends' if is_friend else 'pending' if pending_request else 'none'
        })
    
    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    print(f"\nGetting notifications for user: {request.user.username}")
    notifications = Notification.objects.filter(user=request.user)
    print(f"Found {notifications.count()} notifications")
    
    # Debug: Print all notifications in detail
    for n in notifications:
        print(f"""
        Notification details:
        - ID: {n.id}
        - Type: {n.notification_type}
        - Message: {n.message}
        - Is Read: {n.is_read}
        - Requires Action: {n.requires_action}
        - Reference ID: {n.reference_id}
        - Created At: {n.created_at}
        """)
    
    response_data = [{
        'id': n.id,
        'message': n.message,
        'type': n.notification_type,
        'created_at': n.created_at,
        'is_read': n.is_read,
        'requires_action': n.requires_action,
        'reference_id': n.reference_id
    } for n in notifications]
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    # Get all unread notifications for the user
    notifications = Notification.objects.filter(
        user=request.user,
        is_read=False
    )
    
    # Mark all as read
    notifications.update(is_read=True)
    
    # Delete non-actionable notifications that are read
    Notification.objects.filter(
        user=request.user,
        is_read=True,
        requires_action=False
    ).delete()
    
    return Response({'message': 'Notifications updated'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friend_id):
    try:
        friend = User.objects.get(id=friend_id)
        
        # Remove the friendship records
        Friendship.objects.filter(
            (Q(user=request.user) & Q(friend=friend)) |
            (Q(user=friend) & Q(friend=request.user))
        ).delete()
        
        # Also remove any existing friend requests
        FriendRequest.objects.filter(
            (Q(from_user=request.user) & Q(to_user=friend)) |
            (Q(from_user=friend) & Q(to_user=request.user))
        ).delete()
        
        # Clear from ManyToMany field (this should happen automatically due to through model)
        request.user.friends.remove(friend)
        
        return Response({'message': 'Friend removed successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['POST'])
def google_auth(request):
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'No token provided'}, status=400)

        # Verify the Google token
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
                clock_skew_in_seconds=10  # Add some tolerance for clock skew
            )

            if not idinfo.get('email'):
                print("No email in token info")
                return Response({'error': 'No email in token'}, status=400)

            # Get email from verified token
            email = idinfo['email']
            print(f"Processing Google auth for email: {email}")  # Debug log
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                print(f"Found existing user: {user.username}")  # Debug log
                
                # Generate new token
                Token.objects.filter(user=user).delete()
                token = Token.objects.create(user=user)
                
                return Response({
                    'exists': True,
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            except User.DoesNotExist:
                print(f"No user found for email: {email}")  # Debug log
                return Response({
                    'exists': False,
                    'email': email,
                    'suggested_username': email.split('@')[0]
                })
                
        except ValueError as ve:
            print(f"Token verification failed: {str(ve)}")
            return Response({
                'error': 'Invalid token',
                'details': str(ve)
            }, status=400)
            
    except Exception as e:
        print(f"Unexpected error in google_auth: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        return Response({
            'error': 'Authentication failed',
            'details': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get the current user's profile information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the current user's profile"""
    user = request.user
    
    # Handle form data (for profile image)
    if request.FILES:
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
    
    # Handle JSON data for text fields
    if request.data:
        data = request.data
        if 'username' in data:
            user.username = data['username']
        if 'bio' in data:
            user.bio = data['bio']
        if 'email' in data:
            user.email = data['email']
    
    user.save()
    
    # Return the updated user data
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_betting_stats(request):
    """Get the current user's betting statistics"""
    user = request.user
    
    try:
        # Find all of the user's bets across all leagues
        # We'll check both the UserBet model and the user_bets in LeagueEvent market_data
        
        # Stats to collect
        total_bets = 0
        won_bets = 0
        current_streak = 0
        lifetime_winnings = 0
        
        # Get all league events with user bets
        league_events = LeagueEvent.objects.filter(market_data__has_key='user_bets')
        
        # Track all bets chronologically for streak calculation
        all_bets_results = []
        
        # Process bets from LeagueEvent market_data
        for event in league_events:
            if event.market_data and 'user_bets' in event.market_data:
                user_bets = [bet for bet in event.market_data.get('user_bets', []) 
                            if bet.get('user_id') == user.id]
                
                for bet in user_bets:
                    total_bets += 1
                    # Check if the event is completed and has a result
                    if event.completed and 'result' in bet:
                        result = bet.get('result', '').lower()
                        if result == 'won':
                            won_bets += 1
                            # Add payout to lifetime winnings
                            payout = float(bet.get('payout', 0))
                            lifetime_winnings += payout
                        
                        # Add to chronological list for streak calculation
                        all_bets_results.append({
                            'date': bet.get('bet_time', event.created_at),
                            'result': result
                        })
        
        # Process UserBet model if it's used in the system
        user_bet_objects = UserBet.objects.filter(user=user)
        for bet in user_bet_objects:
            total_bets += 1
            if bet.result == 'won':
                won_bets += 1
                # Need to calculate payout based on points_wagered and the odds if available
                payout = bet.points_wagered * 2  # Default multiplier if we don't have odds
                lifetime_winnings += payout
            
            # Add to chronological list for streak calculation
            all_bets_results.append({
                'date': bet.created_at,
                'result': bet.result
            })
        
        # Sort all bets by date
        all_bets_results = sorted(all_bets_results, key=lambda x: x['date'], reverse=True)
        
        # Calculate current streak
        if all_bets_results:
            current_result = all_bets_results[0]['result']
            for bet in all_bets_results:
                if bet['result'] == current_result:
                    if current_result == 'won':
                        current_streak += 1
                    elif current_result == 'lost':
                        current_streak -= 1
                else:
                    break
        
        # Calculate win rate
        win_rate = 0
        if total_bets > 0:
            win_rate = (won_bets / total_bets) * 100
        
        # Calculate user level based on total bets and win rate
        # Level 1: New user (0-5 bets)
        # Level 2: Regular bettor (6-15 bets)
        # Level 3: Advanced bettor (16-30 bets)
        # Level 4: Expert bettor (31-50 bets)
        # Level 5: Pro bettor (51+ bets)
        # Add a bonus level for high win rates
        base_level = 1
        if total_bets > 50:
            base_level = 5
        elif total_bets > 30:
            base_level = 4
        elif total_bets > 15:
            base_level = 3
        elif total_bets > 5:
            base_level = 2
        
        # Bonus for high win rate
        win_rate_bonus = 0
        if win_rate > 65:
            win_rate_bonus = 1
        
        user_level = min(10, base_level + win_rate_bonus)  # Cap at level 10
        
        # Format the date joined
        date_joined = user.date_joined.strftime('%b %Y') if user.date_joined else 'Unknown'
        
        return Response({
            'total_bets': total_bets,
            'win_rate': round(win_rate, 1),
            'current_streak': current_streak,
            'lifetime_winnings': round(lifetime_winnings, 2),
            'user_level': user_level,
            'date_joined': date_joined
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 