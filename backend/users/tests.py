from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Friendship, FriendRequest, Notification
from datetime import datetime, timedelta

class UserModelTests(TestCase):
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

    def test_user_creation(self):
        self.assertEqual(self.user1.points, 1000)
        self.assertTrue(isinstance(self.user1, User))

    def test_friendship_creation(self):
        friendship = Friendship.objects.create(
            user=self.user1,
            friend=self.user2
        )
        self.assertTrue(Friendship.objects.filter(user=self.user1, friend=self.user2).exists())
        self.assertTrue(self.user1.friends.filter(id=self.user2.id).exists())
        self.assertTrue(self.user2.friends.filter(id=self.user1.id).exists())

    def test_friendship_self_validation(self):
        with self.assertRaises(Exception):
            Friendship.objects.create(user=self.user1, friend=self.user1)

    def test_friend_request_creation(self):
        friend_request = FriendRequest.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        self.assertEqual(friend_request.status, 'pending')
        self.assertTrue(FriendRequest.objects.filter(
            from_user=self.user1,
            to_user=self.user2
        ).exists())

    def test_notification_creation(self):
        notification = Notification.objects.create(
            user=self.user1,
            message='Test notification',
            notification_type='info'
        )
        self.assertFalse(notification.requires_action)
        self.assertFalse(notification.is_read)

        action_notification = Notification.objects.create(
            user=self.user1,
            message='Friend request',
            notification_type='friend_request'
        )
        self.assertTrue(action_notification.requires_action)

    def test_friendship_unique_constraint(self):
        Friendship.objects.create(user=self.user1, friend=self.user2)
        with self.assertRaises(Exception):
            Friendship.objects.create(user=self.user1, friend=self.user2)

    def test_friend_request_unique_constraint(self):
        FriendRequest.objects.create(from_user=self.user1, to_user=self.user2)
        with self.assertRaises(Exception):
            FriendRequest.objects.create(from_user=self.user1, to_user=self.user2)

    def test_notification_ordering(self):
        notification1 = Notification.objects.create(
            user=self.user1,
            message='First notification',
            notification_type='info'
        )
        notification2 = Notification.objects.create(
            user=self.user1,
            message='Second notification',
            notification_type='info'
        )
        notifications = Notification.objects.filter(user=self.user1)
        self.assertEqual(notifications[0], notification2)
        self.assertEqual(notifications[1], notification1)

class UserAPITests(APITestCase):
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

    def test_user_registration(self):
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_friend_request_send(self):
        url = reverse('send-friend-request', args=[self.user2.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(FriendRequest.objects.filter(
            from_user=self.user1,
            to_user=self.user2
        ).exists())

    def test_friend_request_accept(self):
        friend_request = FriendRequest.objects.create(
            from_user=self.user2,
            to_user=self.user1
        )
        url = reverse('accept-friend-request', args=[friend_request.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(friend_request.status, 'accepted')
        self.assertTrue(self.user1.friends.filter(id=self.user2.id).exists())

    def test_notification_list(self):
        Notification.objects.create(
            user=self.user1,
            message='Test notification',
            notification_type='info'
        )
        url = reverse('notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_friend_request_reject(self):
        friend_request = FriendRequest.objects.create(
            from_user=self.user2,
            to_user=self.user1
        )
        url = reverse('reject-friend-request', args=[friend_request.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(friend_request.status, 'rejected')
        self.assertFalse(self.user1.friends.filter(id=self.user2.id).exists())

    def test_friend_list(self):
        Friendship.objects.create(user=self.user1, friend=self.user2)
        url = reverse('friend-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testuser2')

    def test_notification_mark_read(self):
        notification = Notification.objects.create(
            user=self.user1,
            message='Test notification',
            notification_type='info'
        )
        url = reverse('notification-mark-read', args=[notification.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_user_search(self):
        url = reverse('user-search')
        response = self.client.get(url, {'query': 'testuser2'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testuser2')

class UserViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.client.login(username='testuser1', password='testpass123')

    def test_user_profile_view(self):
        url = reverse('user-profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser1')

    def test_user_update_view(self):
        url = reverse('user-update')
        data = {
            'email': 'newemail@example.com'
        }
        response = self.client.patch(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.email, 'newemail@example.com')

    def test_user_points_update(self):
        url = reverse('user-points-update')
        data = {
            'points': 1500
        }
        response = self.client.patch(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.points, 1500)

    def test_user_delete(self):
        url = reverse('user-delete')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(username='testuser1').exists())

    def test_user_password_change(self):
        url = reverse('user-password-change')
        data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123'
        }
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.client.login(username='testuser1', password='newpass123')) 