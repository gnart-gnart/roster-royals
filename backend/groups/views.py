from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BettingGroup, User, GroupInvite
from users.models import Notification  # Import from users app instead
from .serializers import BettingGroupSerializer

class CreateGroupView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BettingGroupSerializer

    def perform_create(self, serializer):
        # Only add the creator as president, not as a member
        group = serializer.save(president=self.request.user)
        # Don't automatically add members - they need to be invited and accept
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
    try:
        group = BettingGroup.objects.get(id=group_id)
        to_user = User.objects.get(id=user_id)
        
        # Check if user is president
        if request.user != group.president:
            return Response({'error': 'Only group president can invite members'}, status=403)
            
        # Check if user is already a member
        if group.members.filter(id=user_id).exists():
            return Response({'error': 'User is already a member'}, status=400)
            
        # Check if invite already exists
        if GroupInvite.objects.filter(group=group, to_user=to_user, status='pending').exists():
            return Response({'error': 'Invite already sent'}, status=400)
            
        # Create invite and notification
        invite = GroupInvite.objects.create(group=group, to_user=to_user)
        Notification.objects.create(
            user=to_user,
            message=f"You've been invited to join {group.name}",
            notification_type='group_invite',
            requires_action=True
        )
        
        return Response({'message': 'Invite sent successfully'})
        
    except BettingGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

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
            
            # Notify group president
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