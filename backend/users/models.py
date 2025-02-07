from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Extended user model"""
    points = models.IntegerField(default=1000)  # Starting points for new users
    friends = models.ManyToManyField('self', symmetrical=True)

class FriendRequest(models.Model):
    """Model for friend requests"""
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], default='pending')

    class Meta:
        unique_together = ('from_user', 'to_user') 