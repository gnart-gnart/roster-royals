from django.db import models
from users.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from decimal import Decimal

class League(models.Model):
    """Model for betting leagues"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  # Optional description
    sports = models.JSONField(default=list, blank=True)  # Store multiple sports as JSON array
    captain = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owned_leagues')
    members = models.ManyToManyField('users.User', related_name='leagues')
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='league_images/', default='league_images/default_image_updated.png', blank=True)

    @property
    def image_url(self):
        """Return the URL of the image."""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return '/media/league_images/default_image_updated.png'

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
    user = models.ForeignKey(User, related_name='user_bets', on_delete=models.CASCADE)
    bet = models.ForeignKey(Bet, related_name='user_bets', on_delete=models.CASCADE)
    choice = models.CharField(max_length=50)  # depends on bet type
    points_wagered = models.IntegerField() # This might become less relevant if entry is money-based
    result = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('won', 'Won'),
        ('lost', 'Lost'),
        ('push', 'Push'), # Added Push/Tie
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    # --- Circuit Related Additions ---
    # Store the specific league event this bet corresponds to, if applicable
    league_event = models.ForeignKey('LeagueEvent', related_name='user_bets', on_delete=models.CASCADE, null=True, blank=True)
    numeric_choice = models.FloatField(
        null=True,
        blank=True,
        help_text="User's numerical guess for tiebreaker events."
    )
    points_earned = models.IntegerField(
        default=0,
        help_text="Points earned for this bet in a circuit, considering weight."
    )
    # ---------------------------------

    class Meta:
        unique_together = ('user', 'bet') # Need to reconsider if 'bet' FK remains primary link

    def clean(self):
        # Ensure numeric_choice is provided only for appropriate tiebreaker events
        if self.numeric_choice is not None and self.league_event and self.league_event.betting_type == 'standard':
            raise ValidationError("Numeric choice can only be provided for tiebreaker events.")
        # Ensure choice is provided for standard events
        if self.numeric_choice is None and self.league_event and self.league_event.betting_type != 'standard':
            raise ValidationError("Standard choice must be provided for standard betting events.")

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
    event_id = models.CharField(max_length=255, null=True, blank=True)  # Field for Odds API event ID (changed to handle string IDs)
    event_name = models.CharField(max_length=255)
    sport = models.CharField(max_length=100)
    commence_time = models.DateTimeField(null=True, blank=True)  # When the event starts
    home_team = models.CharField(max_length=255, null=True, blank=True)
    away_team = models.CharField(max_length=255, null=True, blank=True)
    market_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    # --- Circuit Related Additions ---
    BETTING_TYPE_CHOICES = [
        ('standard', 'Standard'), # Standard betting (moneyline, spread, etc.)
        ('tiebreaker_closest', 'Tiebreaker - Closest Guess'), # Guess a number, closest wins
        ('tiebreaker_unique', 'Tiebreaker - Unique Guess'), # Guess a number, must be unique, closest wins (more complex logic needed)
    ]
    betting_type = models.CharField(
        max_length=20,
        choices=BETTING_TYPE_CHOICES,
        default='standard'
    )
    tiebreaker_correct_value = models.FloatField(
        null=True,
        blank=True,
        help_text="The correct numerical value for 'closest guess' tiebreakers after the event concludes."
    )
    # ---------------------------------

    def __str__(self):
        return f'{self.event_name} ({self.sport}) in league {self.league.name}'

class ChatMessage(models.Model):
    """Model for league chat messages"""
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username} in {self.league.name}: {self.message[:50]}' 
        return f'{self.event_name} ({self.sport}) in league {self.league.name}'

class Circuit(models.Model):
    """Model for a multi-event competition within a league."""
    league = models.ForeignKey(League, related_name='circuits', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    entry_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Entry fee in currency required to join the circuit."
    )
    component_events = models.ManyToManyField(
        LeagueEvent,
        through='CircuitComponentEvent',
        related_name='circuits_included_in'
    )
    tiebreaker_event = models.ForeignKey(
        LeagueEvent,
        on_delete=models.SET_NULL, # Keep circuit even if tiebreaker deleted, requires manual fix
        null=True,
        blank=True, # Allow creation before tiebreaker is set? Or enforce on save?
        related_name='tiebreaker_for_circuits',
        help_text="The designated tiebreaker event. Must be one of the component events."
    )
    status = models.CharField(max_length=20, choices=[
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('calculating', 'Calculating Results'),
        ('completed', 'Completed'),
    ], default='upcoming')
    winner = models.ForeignKey(
        User,
        related_name='circuits_won',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    captain = models.ForeignKey(User, related_name='circuits_created', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()
        # Validation after the instance is saved and has an ID needed for M2M checks
        if self.pk:
            # Ensure tiebreaker is one of the component events
            if self.tiebreaker_event and not self.component_events.filter(pk=self.tiebreaker_event.pk).exists():
                raise ValidationError("The tiebreaker event must be one of the component events.")

    def __str__(self):
        return f"Circuit: {self.name} in League: {self.league.name}"

class CircuitComponentEvent(models.Model):
    """Through model linking Circuits and LeagueEvents, adding weight."""
    circuit = models.ForeignKey(Circuit, on_delete=models.CASCADE)
    league_event = models.ForeignKey(LeagueEvent, on_delete=models.CASCADE)
    weight = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Multiplier for points earned from this event within the circuit."
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('circuit', 'league_event')
        ordering = ['added_at']

    def __str__(self):
        return f"{self.league_event.event_name} in Circuit {self.circuit.name} (Weight: {self.weight})"

class CircuitParticipant(models.Model):
    """Tracks user participation and score within a circuit."""
    circuit = models.ForeignKey(Circuit, related_name='participants', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='circuit_participations', on_delete=models.CASCADE)
    paid_entry = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)
    tiebreaker_bet = models.OneToOneField( # Use OneToOneField for uniqueness
        UserBet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tiebreaker_participant_link',
        help_text="Link to the user's specific bet on the circuit's tiebreaker event."
    )

    class Meta:
        unique_together = ('circuit', 'user')
        ordering = ['-score', 'joined_at'] # Rank by score, then join time

    def clean(self):
        super().clean()
        # Ensure the tiebreaker_bet corresponds to the circuit's tiebreaker_event
        if self.tiebreaker_bet and self.circuit.tiebreaker_event and self.tiebreaker_bet.league_event != self.circuit.tiebreaker_event:
            raise ValidationError("The linked tiebreaker bet must be for the circuit's designated tiebreaker event.")
        if self.tiebreaker_bet and self.tiebreaker_bet.user != self.user:
             raise ValidationError("The linked tiebreaker bet must belong to this participant.")

    def __str__(self):
        return f"{self.user.username} in Circuit {self.circuit.name} (Score: {self.score})"

# Ensure LeagueEvent has related name 'circuits_included_in' if needed later
# models.ManyToManyField('LeagueEvent', ..., related_name='circuits_included_in')

# Consider updating UserBet's Meta unique_together if bets are primarily linked via LeagueEvent now
# class UserBet(models.Model):
#     ...
#     class Meta:
#         unique_together = ('user', 'league_event') # If 'bet' FK is removed or secondary

# Add User model relation if needed (e.g., total circuits joined)
# class User(AbstractUser):
#     ...
#     circuits_joined = models.ManyToManyField('groups.Circuit', through='groups.CircuitParticipant', ...) 