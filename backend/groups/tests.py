from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import BettingGroup, Bet, UserBet, GroupInvite
from users.models import User
from datetime import datetime, timedelta

class GroupModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )

    def test_betting_group_creation(self):
        group = BettingGroup.objects.create(
            name='Test Group',
            description='Test Description',
            sports=['NBA', 'NFL'],
            president=self.user1
        )
        group.members.add(self.user1)
        self.assertEqual(group.name, 'Test Group')
        self.assertEqual(group.sports, ['NBA', 'NFL'])
        self.assertEqual(group.president, self.user1)
        self.assertTrue(group.members.filter(id=self.user1.id).exists())

    def test_bet_creation(self):
        group = BettingGroup.objects.create(
            name='Test Group',
            president=self.user1
        )
        deadline = timezone.now() + timedelta(days=1)
        bet = Bet.objects.create(
            group=group,
            name='Test Bet',
            type='spread',
            points=100,
            deadline=deadline
        )
        self.assertEqual(bet.status, 'open')
        self.assertEqual(bet.type, 'spread')
        self.assertEqual(bet.points, 100)

    def test_user_bet_creation(self):
        group = BettingGroup.objects.create(
            name='Test Group',
            president=self.user1
        )
        bet = Bet.objects.create(
            group=group,
            name='Test Bet',
            type='spread',
            points=100,
            deadline=timezone.now() + timedelta(days=1)
        )
        user_bet = UserBet.objects.create(
            user=self.user1,
            bet=bet,
            choice='over',
            points_wagered=50
        )
        self.assertEqual(user_bet.result, 'pending')
        self.assertEqual(user_bet.points_wagered, 50)

    def test_group_invite_creation(self):
        group = BettingGroup.objects.create(
            name='Test Group',
            president=self.user1
        )
        invite = GroupInvite.objects.create(
            group=group,
            to_user=self.user2
        )
        self.assertEqual(invite.status, 'pending')

class GroupAPITests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.client.force_login(self.user1)
        self.group = BettingGroup.objects.create(
            name='Test Group',
            president=self.user1
        )
        self.group.members.add(self.user1)

    def test_create_betting_group(self):
        url = reverse('group-create')
        data = {
            'name': 'New Group',
            'description': 'New Description',
            'sports': ['NBA', 'NFL']
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(BettingGroup.objects.filter(name='New Group').exists())

    def test_create_bet(self):
        url = reverse('bet-create', args=[self.group.id])
        data = {
            'name': 'New Bet',
            'type': 'spread',
            'points': 100,
            'deadline': (timezone.now() + timedelta(days=1)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Bet.objects.filter(name='New Bet').exists())

    def test_place_bet(self):
        bet = Bet.objects.create(
            group=self.group,
            name='Test Bet',
            type='spread',
            points=100,
            deadline=timezone.now() + timedelta(days=1)
        )
        url = reverse('place-bet', args=[bet.id])
        data = {
            'choice': 'over',
            'points_wagered': 50
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserBet.objects.filter(
            user=self.user1,
            bet=bet
        ).exists())

    def test_send_group_invite(self):
        url = reverse('send-group-invite', args=[self.group.id])
        data = {
            'to_user': self.user2.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(GroupInvite.objects.filter(
            group=self.group,
            to_user=self.user2
        ).exists())

class GroupViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.client.login(username='testuser1', password='testpass123')
        self.group = BettingGroup.objects.create(
            name='Test Group',
            president=self.user1
        )
        self.group.members.add(self.user1)

    def test_group_detail_view(self):
        url = reverse('group-detail', args=[self.group.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Test Group')

    def test_group_update_view(self):
        url = reverse('group-update', args=[this.group.id])
        data = {
            'description': 'Updated Description'
        }
        response = self.client.patch(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.group.refresh_from_db()
        self.assertEqual(self.group.description, 'Updated Description') 