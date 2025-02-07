from django.db import models
from users.models import User

class BettingGroup(models.Model):
    """Model for betting groups"""
    name = models.CharField(max_length=100)
    sport = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    president = models.ForeignKey(User, related_name='owned_groups', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='joined_groups')

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