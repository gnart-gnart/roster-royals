from rest_framework import serializers
from .models import User, FriendRequest

class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    def get_profile_image_url(self, obj):
        return obj.profile_image_url
        
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'points', 'money', 'bio', 'profile_image', 'profile_image_url')
        read_only_fields = ('points', 'money', 'profile_image_url')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user 