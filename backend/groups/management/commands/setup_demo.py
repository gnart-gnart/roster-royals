from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from groups.models import (
    League, Circuit, LeagueEvent, CircuitComponentEvent, 
    CircuitParticipant, UserBet, LeagueInvite, Bet
)
import datetime
import json
import logging

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
        
        # Create a league with slowpoke as captain and miles, gwen as members
        league = self.create_league(slowpoke, [miles, gwen])
        
        # Create events for the circuit
        events = self.create_events(league)
        
        # Create a circuit with the events
        circuit = self.create_circuit(league, slowpoke, events)
        
        # Add miles and gwen as participants and place their bets
        self.add_participants_and_bets(circuit, [miles, gwen], events)
        
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
            
        return slowpoke, miles, gwen, pikachu

    def create_league(self, captain, members):
        """Create a demo league"""
        league = League.objects.create(
            name='Demo League',
            description='A league for demonstration purposes',
            captain=captain,
            sports=['basketball', 'hockey', 'baseball', 'football']
        )
        
        # Add members
        league.members.add(captain)
        for member in members:
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
                'winner': 'Golden State Warriors'
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
                'winner': 'Oklahoma City Thunder'
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
                'options': [str(i) for i in range(10, 50)]  # Points range
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
                'options': ['Team Rocket', 'Team Galactic']
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
        
        for participant in participants:
            # Add as circuit participant
            cp = CircuitParticipant.objects.create(
                circuit=circuit,
                user=participant,
                paid_entry=True,
                score=0  # Initialize score
            )
            
            # Deduct entry fee
            participant.money -= circuit.entry_fee
            participant.save()
            
            # Place bets on completed events
            # Rockets vs Warriors (events[0]) - miles and gwen bet differently
            if participant == participants[0]:  # miles
                warriors_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[0],
                    bet=bet_mapping[events[0].id],  # Use the corresponding Bet
                    choice='Golden State Warriors',  # Correct choice
                    points_earned=2,  # Weight is 2
                    result='won',
                    points_wagered=2  # Weight is 2
                )
                # Update participant score
                cp.score += 2
                cp.save()
            else:  # gwen
                rockets_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[0],
                    bet=bet_mapping[events[0].id],  # Use the corresponding Bet
                    choice='Houston Rockets',  # Incorrect choice
                    points_earned=0,
                    result='lost',
                    points_wagered=2  # Weight is 2
                )
            
            # Grizzlies vs Thunder (events[1]) - both bet correctly
            thunder_bet = UserBet.objects.create(
                user=participant,
                league_event=events[1],
                bet=bet_mapping[events[1].id],  # Use the corresponding Bet
                choice='Oklahoma City Thunder',  # Correct choice
                points_earned=1,  # Weight is 1
                result='won',
                points_wagered=1  # Weight is 1
            )
            # Update participant score
            cp.score += 1
            cp.save()
            
            # Tiebreaker guesses (Lebron points - events[2])
            if participant == participants[0]:  # miles
                points_guess = 25
            else:  # gwen
                points_guess = 22
                
            tiebreaker_bet = UserBet.objects.create(
                user=participant,
                league_event=events[2],
                bet=bet_mapping[events[2].id],  # Use the corresponding Bet
                choice='',  # Not applicable for tiebreaker
                numeric_choice=points_guess,
                points_earned=0,  # Not computed yet
                result='pending',
                points_wagered=1  # Weight is 1
            )
            
            # Set as tiebreaker bet for participant
            cp.tiebreaker_bet = tiebreaker_bet
            cp.save()
            
            # Team battle bets (events[3]) - gwen will bet Team Rocket (wrong), miles will bet Team Galactic (correct)
            if participant == participants[0]:  # miles
                team_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[3],
                    bet=bet_mapping[events[3].id],  # Use the corresponding Bet
                    choice='Team Galactic',  # Will be correct
                    points_earned=0,  # Not computed yet
                    result='pending',
                    points_wagered=3  # Weight is 3
                )
            else:  # gwen
                team_bet = UserBet.objects.create(
                    user=participant,
                    league_event=events[3],
                    bet=bet_mapping[events[3].id],  # Use the corresponding Bet
                    choice='Team Rocket',  # Will be incorrect
                    points_earned=0,  # Not computed yet
                    result='pending',
                    points_wagered=3  # Weight is 3
                )
            
            self.stdout.write(self.style.SUCCESS(f'Added participant {participant.username} with bets'))
    
    def create_invite(self, league, from_user, to_user):
        """Create an invite for pikachu to join the league"""
        invite = LeagueInvite.objects.create(
            league=league,
            to_user=to_user,
            status='pending'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created invite for {to_user.username} to join {league.name}'))
        return invite 