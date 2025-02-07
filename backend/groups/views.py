from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BettingGroup, User
from .serializers import BettingGroupSerializer

class CreateGroupView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BettingGroupSerializer

    def perform_create(self, serializer):
        group = serializer.save(president=self.request.user)
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