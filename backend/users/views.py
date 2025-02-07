from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer, UserRegistrationSerializer
from .models import User, FriendRequest

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
        FriendRequest.objects.create(
            from_user=request.user,
            to_user=to_user
        )
        return Response({'message': 'Friend request sent'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

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
            friend_request.status = 'accepted'
            friend_request.save()
            friend_request.from_user.friends.add(request.user)
            friend_request.to_user.friends.add(friend_request.from_user)
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
    user = request.user
    friends = user.friends.all()
    return Response(UserSerializer(friends, many=True).data) 