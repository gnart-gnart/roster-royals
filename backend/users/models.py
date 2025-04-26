from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

class User(AbstractUser):
    """Extended user model"""
    points = models.IntegerField(default=0)  # Starting points for new users
    money = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)  # Money for betting ($1000 default)
    friends = models.ManyToManyField(
        'self',
        symmetrical=True,
        blank=True,
        through='Friendship'
    )
    bio = models.TextField(blank=True, null=True)  # Bio information
    profile_image = models.ImageField(upload_to='profile_images/', default='profile_images/default_profile.png', blank=True)

    @property
    def profile_image_url(self):
        """Return the URL of the profile image."""
        if self.profile_image and hasattr(self.profile_image, 'url'):
            return self.profile_image.url
        return '/media/profile_images/default_profile.png'

class Friendship(models.Model):
    """Model to handle friendships and prevent self-friendship"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_of')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'friend')

    def clean(self):
        if self.user == self.friend:
            raise ValidationError("Users cannot be friends with themselves.")

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

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=50, choices=[
        ('friend_request', 'Friend Request'),
        ('friend_accepted', 'Friend Request Accepted'),
        ('league_invite', 'League Invitation'),
        ('info', 'Information'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    requires_action = models.BooleanField(default=False)
    reference_id = models.IntegerField(null=True, blank=True)
    related_user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='related_notifications', null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Automatically set requires_action based on notification type
        if not self.id:  # Only on creation
            self.requires_action = self.notification_type in ['friend_request', 'league_invite']
        super().save(*args, **kwargs) 