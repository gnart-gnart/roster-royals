from django.db import models
from users.models import User
from django.conf import settings

class BettingGroup(models.Model):
    """Model for betting groups"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  # Optional description
    sports = models.JSONField(default=list, blank=True)  # Store multiple sports as JSON array
    president = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owned_betting_groups')
    members = models.ManyToManyField('users.User', related_name='betting_groups')
    created_at = models.DateTimeField(auto_now_add=True)

class Bet(models.Model):
    """Model for bets within a group"""
    group = models.ForeignKey(BettingGroup, related_name='bets', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)  # spread, moneyline, over/under
    points = models.IntegerField()
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('settled', 'Settled'),
    ], default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()

class UserBet(models.Model):
    """Model for users' bets"""
    user = models.ForeignKey(User, related_name='bets', on_delete=models.CASCADE)
    bet = models.ForeignKey(Bet, related_name='user_bets', on_delete=models.CASCADE)
    choice = models.CharField(max_length=50)  # depends on bet type
    points_wagered = models.IntegerField()
    result = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'bet')

class GroupInvite(models.Model):
    group = models.ForeignKey(BettingGroup, on_delete=models.CASCADE, related_name='invites')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_invites')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], default='pending')

    class Meta:
        unique_together = ('group', 'to_user') 

class GroupBet(models.Model):
    """A bet available in a betting group that members can place wagers on"""
    group = models.ForeignKey(BettingGroup, on_delete=models.CASCADE, related_name='bets')
    event_key = models.CharField(max_length=100)
    market_key = models.CharField(max_length=100)
    
    # Store event details for display purposes
    event_name = models.CharField(max_length=255)
    market_name = models.CharField(max_length=255)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    
    # Additional event info
    start_time = models.DateTimeField()
    sport = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.event_name} - {self.market_name}"

class BetOutcome(models.Model):
    """An outcome option for a particular group bet"""
    group_bet = models.ForeignKey(GroupBet, on_delete=models.CASCADE, related_name='outcomes')
    outcome_key = models.CharField(max_length=100)
    outcome_name = models.CharField(max_length=255)
    odds = models.FloatField()
    
    def __str__(self):
        return f"{self.outcome_name} ({self.odds})"

class MemberBet(models.Model):
    """A bet placed by a group member on a specific outcome"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bets')
    outcome = models.ForeignKey(BetOutcome, on_delete=models.CASCADE, related_name='member_bets')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    placed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('won', 'Won'),
        ('lost', 'Lost'),
        ('cancelled', 'Cancelled')
    ], default='pending')
    
    @property
    def potential_winnings(self):
        return self.amount * self.outcome.odds
    
    def __str__(self):
        return f"{self.user.username} bet {self.amount} on {self.outcome.outcome_name}"