from django.db import models
from users.models import User

class League(models.Model):
    """Model for betting leagues"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  # Optional description
    sports = models.JSONField(default=list, blank=True)  # Store multiple sports as JSON array
    captain = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owned_leagues')
    members = models.ManyToManyField('users.User', related_name='leagues')
    created_at = models.DateTimeField(auto_now_add=True)

class Bet(models.Model):
    """Model for bets within a league"""
    league = models.ForeignKey(League, related_name='bets', on_delete=models.CASCADE)
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

class LeagueInvite(models.Model):
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='invites')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='league_invites')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], default='pending')

    class Meta:
        unique_together = ('league', 'to_user')

class LeagueEvent(models.Model):
    """Model for a betting event posted to a league."""
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='league_events')
    event_key = models.CharField(max_length=255)
    event_id = models.IntegerField(null=True, blank=True)  # New field to store the Odds API event ID
    event_name = models.CharField(max_length=255)
    sport = models.CharField(max_length=100)
    market_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.event_name} ({self.sport}) in league {self.league.name}' 