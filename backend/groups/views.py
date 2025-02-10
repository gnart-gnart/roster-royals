from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BettingGroup, User, GroupInvite
from users.models import Notification  # Import from users app instead
from .serializers import BettingGroupSerializer
from .cloudbet import CloudbetClient

class CreateGroupView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BettingGroupSerializer

    def perform_create(self, serializer):
        # Create group with current user as president
        group = serializer.save(president=self.request.user)
        # Add president as first member
        group.members.add(self.request.user)
        return group

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_group_member(request, group_id, user_id):
    try:
        group = BettingGroup.objects.get(id=group_id, president=request.user)
        user = User.objects.get(id=user_id)
        group.members.add(user)
        return Response({'message': 'Member added successfully'})
    except BettingGroup.DoesNotExist:
        return Response({'error': 'Group not found or not authorized'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_groups(request):
    user = request.user
    groups = BettingGroup.objects.filter(members=user)
    return Response(BettingGroupSerializer(groups, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_to_group(request, group_id, user_id):
    print(f"\nProcessing group invite:")
    print(f"- From: {request.user.username}")
    print(f"- Group ID: {group_id}")
    print(f"- To User ID: {user_id}")
    
    try:
        group = BettingGroup.objects.get(id=group_id)
        to_user = User.objects.get(id=user_id)
        
        print(f"Found group '{group.name}' and user '{to_user.username}'")
        
        # Check if user is president
        if request.user != group.president:
            print(f"ERROR: {request.user.username} is not president of this group")
            return Response({'error': 'Only group president can invite members'}, status=403)
        
        # Create invite
        invite = GroupInvite.objects.create(
            group=group,
            to_user=to_user,
            status='pending'
        )
        print(f"Created GroupInvite with ID: {invite.id}")

        # Create notification
        notification = Notification.objects.create(
            user=to_user,
            message=f"{request.user.username} invited you to join {group.name}",
            notification_type='group_invite',
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
def handle_group_invite(request, invite_id):
    try:
        invite = GroupInvite.objects.get(
            id=invite_id,
            to_user=request.user,
            status='pending'
        )
        action = request.data.get('action')
        
        if action == 'accept':
            invite.status = 'accepted'
            invite.save()
            invite.group.members.add(request.user)
            
            # Create notification for group president
            Notification.objects.create(
                user=invite.group.president,
                message=f"{request.user.username} joined {invite.group.name}",
                notification_type='info'
            )
            
            # Delete the invitation notification
            Notification.objects.filter(
                user=request.user,
                notification_type='group_invite',
                requires_action=True
            ).delete()
            
            return Response({'message': 'Invite accepted'})
            
        elif action == 'reject':
            invite.status = 'rejected'
            invite.save()
            
            # Delete the invitation notification
            Notification.objects.filter(
                user=request.user,
                notification_type='group_invite',
                requires_action=True
            ).delete()
            
            return Response({'message': 'Invite rejected'})
            
    except GroupInvite.DoesNotExist:
        return Response({'error': 'Invite not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group(request, group_id):
    print(f"\nFetching group details:")
    print(f"- Group ID: {group_id}")
    print(f"- User: {request.user.username}")
    
    try:
        group = BettingGroup.objects.get(id=group_id)
        print(f"Found group: {group.name}")
        serialized_data = BettingGroupSerializer(group).data
        print(f"Serialized data: {serialized_data}")
        return Response(serialized_data)
    except BettingGroup.DoesNotExist:
        print(f"Group {group_id} not found")
        return Response({'error': 'Group not found'}, status=404)
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_bets(request, sport=None):
    try:
        print("\nDEBUG: Fetching bets")
        print(f"Sport param: {sport}")
        
        client = CloudbetClient()
        if sport:
            print(f"Fetching events for sport: {sport}")
            events = client.get_events(sport)
            print(f"Events response: {events}")
            return Response(events)
        else:
            print("Fetching all sports")
            sports = client.get_sports()
            print(f"Sports response: {sports}")
            return Response(sports)
            
    except Exception as e:
        print(f"ERROR in get_available_bets: {str(e)}")
        print(f"Error type: {type(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_bets_endpoint(request):
    print("Test endpoint hit!")
    return Response({"message": "Test endpoint working"}) 