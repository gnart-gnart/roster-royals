from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from groups.models import (
    League, Circuit, LeagueEvent, CircuitComponentEvent, 
    CircuitParticipant, UserBet, LeagueInvite, Bet
)
from users.models import FriendRequest
import datetime
import json
import logging
import os
from django.core.files import File

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sets up demo data for presentation'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting demo setup...'))
        
        # Clear existing data
        self.clear_existing_data()
        
        # Create users if they don't exist
        slowpoke, miles, gwen, pikachu = self.create_users()
        
        # Make all users friends with each other
        self.make_users_friends([slowpoke, miles, gwen, pikachu])
        
        # Create a league with slowpoke as captain and miles, gwen as members
        league = self.create_league(slowpoke, [miles, gwen, pikachu])
        
        # Create events for the circuit
        events = self.create_events(league)
        
        # Create a circuit with the events
        circuit = self.create_circuit(league, slowpoke, events)
        
        # Add all users as participants and place their bets
        self.add_participants_and_bets(circuit, [slowpoke, miles, gwen], events)
        
        # Create invite for pikachu (will be accepted during demo)
        self.create_invite(league, slowpoke, pikachu)
        
        self.stdout.write(self.style.SUCCESS('Demo setup completed successfully!'))

    def clear_existing_data(self):
        """Clear existing data for the demo users"""
        usernames = ['slowpoke', 'miles', 'gwen', 'pikachu']
        users = User.objects.filter(username__in=usernames)
        
        # Delete leagues captained by these users
        League.objects.filter(captain__in=users).delete()
        
        # Delete circuit participations
        CircuitParticipant.objects.filter(user__in=users).delete()
        
        # Delete user bets
        UserBet.objects.filter(user__in=users).delete()
        
        # Delete invites
        LeagueInvite.objects.filter(to_user__in=users).delete()
        
        # Delete friend requests between these users
        FriendRequest.objects.filter(from_user__in=users, to_user__in=users).delete()
        
        self.stdout.write(self.style.SUCCESS('Cleared existing data'))

    def create_users(self):
        """Create or get the demo users"""
        # Create or get slowpoke user
        slowpoke, created = User.objects.get_or_create(
            username='slowpoke',
            defaults={
                'email': 'slowpoke@example.com',
                'money': Decimal('1000.00'),
            }
        )
        if created:
            slowpoke.set_password('password123')
            slowpoke.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {slowpoke.username}'))
        else:
            # Update money
            slowpoke.money = Decimal('1000.00')
            slowpoke.save()
            
        # Create or get miles user
        miles, created = User.objects.get_or_create(
            username='miles',
            defaults={
                'email': 'miles@example.com',
                'money': Decimal('1000.00'),
            }
        )
        if created:
            miles.set_password('password123')
            miles.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {miles.username}'))
        else:
            # Update money
            miles.money = Decimal('1000.00')
            miles.save()
            
        # Create or get gwen user
        gwen, created = User.objects.get_or_create(
            username='gwen',
            defaults={
                'email': 'gwen@example.com',
                'money': Decimal('1000.00'),
            }
        )
        if created:
            gwen.set_password('password123')
            gwen.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {gwen.username}'))
        else:
            # Update money
            gwen.money = Decimal('1000.00')
            gwen.save()
            
        # Create or get pikachu user
        pikachu, created = User.objects.get_or_create(
            username='pikachu',
            defaults={
                'email': 'pikachu@example.com',
                'money': Decimal('1000.00'),
            }
        )
        if created:
            pikachu.set_password('password123')
            pikachu.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {pikachu.username}'))
        else:
            # Update money
            pikachu.money = Decimal('1000.00')
            pikachu.save()
            
        # Set profile pictures
        self.set_profile_pictures([slowpoke, miles, gwen, pikachu])
            
        return slowpoke, miles, gwen, pikachu
    
    def set_profile_pictures(self, users):
        """Set profile pictures for each user"""
        pfp_dir = 'demo/pfp'
        if not os.path.exists(pfp_dir):
            self.stdout.write(self.style.WARNING(f'Profile picture directory {pfp_dir} not found'))
            return
            
        for user in users:
            pfp_path = os.path.join(pfp_dir, f'{user.username}.png')
            if os.path.exists(pfp_path):
                with open(pfp_path, 'rb') as f:
                    # Save to profile_images directory with the username as the filename
                    user.profile_image.save(f'profile_images/{user.username}.png', File(f), save=True)
                self.stdout.write(self.style.SUCCESS(f'Set profile picture for {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'Profile picture for {user.username} not found at {pfp_path}'))

    def make_users_friends(self, users):
        """Make all users friends with each other"""
        for i, user1 in enumerate(users):
            for user2 in users[i+1:]:
                # Check if they're already friends
                if user2 not in user1.friends.all():
                    # Add each other as friends
                    user1.friends.add(user2)
                    user2.friends.add(user1)
                    self.stdout.write(self.style.SUCCESS(f'Made {user1.username} and {user2.username} friends'))

    def create_league(self, captain, members):
        """Create a demo league"""
        league = League.objects.create(
            name='Demo League',
            description='A league for demonstration purposes',
            captain=captain,
            sports=['basketball', 'hockey', 'baseball', 'football']
        )
        
        # Add members (except pikachu)
        league.members.add(captain)
        for member in members:
            # Only add miles and gwen initially, not pikachu (who will be invited during demo)
            if member.username != 'pikachu':
                league.members.add(member)
            
        self.stdout.write(self.style.SUCCESS(f'Created league: {league.name}'))
        return league

    def create_events(self, league):
        """Create demo events for the circuit"""
        events = []
        
        # Event 1: Rockets vs. Warriors Game 3 (completed)
        rockets_warriors = LeagueEvent.objects.create(
            league=league,
            event_key='nba_rockets_warriors_g3',
            event_name='Rockets vs. Warriors Game 3',
            sport='basketball',
            commence_time=timezone.now() - datetime.timedelta(days=2),
            home_team='Golden State Warriors',
            away_team='Houston Rockets',
            completed=True,
            betting_type='standard',
            market_data={
                'home_score': 104,
                'away_score': 93,
                'winner': 'Golden State Warriors',
                'custom': False,
                'circuit_bets': []  # Add empty circuit_bets array
            }
        )
        events.append(rockets_warriors)
        
        # Event 2: Grizzlies vs. Thunder Game 2 (completed)
        grizzlies_thunder = LeagueEvent.objects.create(
            league=league,
            event_key='nba_grizzlies_thunder_g2',
            event_name='Grizzlies vs. Thunder Game 2',
            sport='basketball',
            commence_time=timezone.now() - datetime.timedelta(days=3),
            home_team='Oklahoma City Thunder',
            away_team='Memphis Grizzlies',
            completed=True,
            betting_type='standard',
            market_data={
                'home_score': 118,
                'away_score': 99,
                'winner': 'Oklahoma City Thunder',
                'custom': False,
                'circuit_bets': []  # Add empty circuit_bets array
            }
        )
        events.append(grizzlies_thunder)
        
        # Event 3: Lebron points (tiebreaker - not completed)
        lebron_points = LeagueEvent.objects.create(
            league=league,
            event_key='nba_lebron_points',
            event_name='How many points will Lebron score tonight?',
            sport='basketball',
            commence_time=timezone.now() + datetime.timedelta(hours=4),
            completed=False,
            betting_type='tiebreaker_closest',  # For tiebreaker
            market_data={
                'options': [str(i) for i in range(10, 50)],  # Points range
                'custom': True,  # Mark as custom event
                'answerType': 'number',  # Numeric input required
                'circuit_bets': []  # Add empty circuit_bets array
            }
        )
        events.append(lebron_points)
        
        # Event 4: Team Rocket vs Team Galactic (not completed)
        team_battle = LeagueEvent.objects.create(
            league=league,
            event_key='pokemon_team_battle',
            event_name='Who will win tonight\'s game? Team Rocket or Team Galactic',
            sport='esports',
            commence_time=timezone.now() + datetime.timedelta(hours=6),
            home_team='Team Galactic',
            away_team='Team Rocket',
            completed=False,
            betting_type='standard',
            market_data={
                'options': ['Team Rocket', 'Team Galactic'],
                'custom': True,  # Mark as custom event
                'answerType': 'multipleChoice',  # Multiple choice input
                'answerOptions': ['Team Rocket', 'Team Galactic'],  # Same options as before
                'circuit_bets': []  # Add empty circuit_bets array
            }
        )
        events.append(team_battle)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(events)} events'))
        return events

    def create_circuit(self, league, captain, events):
        """Create a demo circuit with the given events"""
        circuit = Circuit.objects.create(
            league=league,
            name='Demo Circuit',
            description='A circuit for demonstration purposes',
            entry_fee=Decimal('25.00'),
            captain=captain,
            status='active',
            tiebreaker_event=events[2]  # Lebron points is the tiebreaker
        )
        
        # Add events to circuit with weights
        CircuitComponentEvent.objects.create(circuit=circuit, league_event=events[0], weight=2)  # Rockets vs Warriors (weight 2)
        CircuitComponentEvent.objects.create(circuit=circuit, league_event=events[1], weight=1)  # Grizzlies vs Thunder (weight 1)
        CircuitComponentEvent.objects.create(circuit=circuit, league_event=events[2], weight=1)  # Lebron points (weight 1)
        CircuitComponentEvent.objects.create(circuit=circuit, league_event=events[3], weight=3)  # Team battle (weight 3)
        
        self.stdout.write(self.style.SUCCESS(f'Created circuit: {circuit.name}'))
        return circuit

    def add_participants_and_bets(self, circuit, participants, events):
        """Add participants to the circuit and place their bets"""
        # Create a Bet object for each event
        bet_mapping = {}
        for event in events:
            bet = Bet.objects.create(
                league=circuit.league,
                name=f'Bet on {event.event_name}',
                type='moneyline' if event.betting_type == 'standard' else 'tiebreaker',
                points=10,  # Default points value
                deadline=event.commence_time or (timezone.now() + datetime.timedelta(hours=24)),
                status='settled' if event.completed else 'open'
            )
            bet_mapping[event.id] = bet
        
        # Points distribution as requested:
        # slowpoke - 1 point (one winning bet)
        # miles - 2 points (one winning bet)
        # gwen - 3 points (two winning bets)
        
        # Get pikachu for creating bets (even though not a participant yet)
        pikachu = User.objects.get(username='pikachu')
        all_users = participants + [pikachu]
        
        # Create participant entries for first three users in participants list
        for participant in participants:
            # Add as circuit participant
            cp = CircuitParticipant.objects.create(
                circuit=circuit,
                user=participant,
                paid_entry=True,
                score=0  # Initialize score - will update below
            )
            
            # Deduct entry fee
            participant.money -= circuit.entry_fee
            participant.save()
            
            # Place bets for each participant and update scores accordingly
            if participant == participants[0]:  # slowpoke
                # Bet on Rockets vs. Warriors - bet on Houston Rockets (lost)
                UserBet.objects.create(
                    user=participant,
                    league_event=events[0],
                    bet=bet_mapping[events[0].id],
                    choice='Houston Rockets',  # Incorrect choice
                    points_earned=0,
                    result='lost',
                    points_wagered=2  # Weight is 2
                )
                
                # Bet on Grizzlies vs. Thunder - bet on Grizzlies (also lost)
                thunder_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[1],
                    bet=bet_mapping[events[1].id],
                    choice='Memphis Grizzlies',  # Incorrect choice - changed from Thunder to make him lose
                    points_earned=0,
                    result='lost',
                    points_wagered=1  # Weight is 1
                )
                # Update score
                cp.score = 0  # 0 points for slowpoke - lost both events
                cp.save()
                
                # Add circuit points to user profile
                if hasattr(participant, 'points'):
                    participant.points = participant.points + 0  # No points added
                    participant.save()
                
            elif participant == participants[1]:  # miles
                # Bet on Rockets vs. Warriors - bet on Warriors (win)
                warriors_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[0],
                    bet=bet_mapping[events[0].id],
                    choice='Golden State Warriors',  # Correct choice
                    points_earned=2,  # Weight is 2
                    result='won',
                    points_wagered=2  # Weight is 2
                )
                
                # Bet on Grizzlies vs. Thunder - bet on Grizzlies (lost)
                UserBet.objects.create(
                    user=participant,
                    league_event=events[1],
                    bet=bet_mapping[events[1].id],
                    choice='Memphis Grizzlies',  # Incorrect choice
                    points_earned=0,
                    result='lost',
                    points_wagered=1  # Weight is 1
                )
                # Update score
                cp.score = 2  # 2 points for miles
                cp.save()
                
                # Add circuit points to user profile
                if hasattr(participant, 'points'):
                    participant.points = participant.points + 2
                    participant.save()
                
            else:  # gwen
                # Bet on Rockets vs. Warriors - bet on Warriors (win)
                warriors_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[0],
                    bet=bet_mapping[events[0].id],
                    choice='Golden State Warriors',  # Correct choice
                    points_earned=2,  # Weight is 2
                    result='won',
                    points_wagered=2  # Weight is 2
                )
                
                # Bet on Grizzlies vs. Thunder - bet on Thunder (win)
                thunder_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[1],
                    bet=bet_mapping[events[1].id],
                    choice='Oklahoma City Thunder',  # Correct choice
                    points_earned=1,  # Weight is 1
                    result='won',
                    points_wagered=1  # Weight is 1
                )
                # Update score
                cp.score = 3  # 3 points for gwen
                cp.save()
                
                # Add circuit points to user profile
                if hasattr(participant, 'points'):
                    participant.points = participant.points + 3
                    participant.save()
            
            # Tiebreaker guesses (Lebron points - events[2])
            if participant == participants[0]:  # slowpoke
                # Don't create a tiebreaker bet for Slowpoke - will be done manually during demo
                pass
            else:  # Miles and Gwen should have the same guess of 20
                points_guess = 20
                
                tiebreaker_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[2],
                    bet=bet_mapping[events[2].id],
                    choice='',  # Not applicable for tiebreaker
                    numeric_choice=points_guess,
                    points_earned=0,  # Not computed yet
                    result='pending',
                    points_wagered=1  # Weight is 1
                )
                
                # Set as tiebreaker bet for participant
                cp.tiebreaker_bet = tiebreaker_bet
                cp.save()
            
            # Team battle bets (events[3]) - each user bets differently
            if participant == participants[0]:  # slowpoke
                # Don't create a team battle bet for Slowpoke - will be done manually during demo
                pass
            elif participant == participants[1]:  # miles
                team_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[3],
                    bet=bet_mapping[events[3].id],
                    choice='Team Galactic',  # Will be correct
                    points_earned=0,  # Not computed yet
                    result='pending',
                    points_wagered=3  # Weight is 3
                )
            else:  # gwen
                team_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[3],
                    bet=bet_mapping[events[3].id],
                    choice='Team Rocket',  # Will be incorrect
                    points_earned=0,  # Not computed yet
                    result='pending',
                    points_wagered=3  # Weight is 3
                )
            
            # Add completed bets to the participant
            # Mark first two events as completed bets since they're the ones that have already happened
            cp.completed_bets.add(events[0], events[1])
            
            self.stdout.write(self.style.SUCCESS(f'Added participant {participant.username} with bets'))
        
        # Create bets for pikachu (even though not a participant yet)
        # This ensures that when pikachu joins the circuit, their bets will already be visible
        # Bet on Rockets vs. Warriors - bet on Warriors (win)
        UserBet.objects.create(
            user=pikachu,
            league_event=events[0],
            bet=bet_mapping[events[0].id],
            choice='Golden State Warriors',  # Correct choice
            points_earned=0,  # No points since not a participant yet
            result='pending',
            points_wagered=2  # Weight is 2
        )
        
        # Bet on Grizzlies vs. Thunder - bet on Thunder (win)
        UserBet.objects.create(
            user=pikachu,
            league_event=events[1],
            bet=bet_mapping[events[1].id],
            choice='Oklahoma City Thunder',  # Correct choice
            points_earned=0,  # No points since not a participant yet
            result='pending',
            points_wagered=1  # Weight is 1
        )
        
        # Team battle bet for pikachu
        UserBet.objects.create(
            user=pikachu,
            league_event=events[3],
            bet=bet_mapping[events[3].id],
            choice='Team Galactic',  # Will be correct
            points_earned=0,  # Not computed yet
            result='pending',
            points_wagered=3  # Weight is 3
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created bets for {pikachu.username} (not yet a participant)'))

    def create_invite(self, league, from_user, to_user):
        """Create an invite for pikachu to join the league"""
        invite = LeagueInvite.objects.create(
            league=league,
            to_user=to_user,
            status='pending'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created invite for {to_user.username} to join {league.name}'))
        return invite 