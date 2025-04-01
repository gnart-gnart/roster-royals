#!/bin/bash

# Reset test profiles for Grant, Judy, and Buddy
# Grant will have a group (league) that includes Judy and Buddy, with no bets

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Resetting test user profiles..."

# Run the Django shell command to reset users
docker compose exec -T django-web python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from groups.models import League, LeagueInvite, LeagueEvent
from users.models import User, Notification, Friendship
from decimal import Decimal
import random

User = get_user_model()

# Reset users if they already exist, otherwise create them
def reset_user(username, email):
    # Use the username as the password (all lowercase)
    password = username.lower()
    try:
        user = User.objects.get(username=username)
        print(f"Resetting existing user: {username}")
        # Reset points to 0 and money to $1000.00
        user.points = 0
        user.money = Decimal('1000.00')
        # Update password to match username
        user.set_password(password)
        user.save()
        print(f"Password set to: {password}")
    except User.DoesNotExist:
        print(f"Creating new user: {username}")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            points=0,
            money=Decimal('1000.00')
        )
        print(f"Password set to: {password}")
    return user

# Create or reset our test users
grant = reset_user("grant", "grant@example.com")
judy = reset_user("judy", "judy@example.com")
buddy = reset_user("buddy", "buddy@example.com")

# Double-check money is exactly $1000.00 and points are 0
for user in [grant, judy, buddy]:
    user.money = Decimal('1000.00')
    user.points = 0
    user.save()
    print(f"Confirmed {user.username}'s money balance: ${user.money}")
    print(f"Confirmed {user.username}'s points: {user.points}")

# Clear existing relationships
print("Clearing existing relationships...")

# Delete all leagues owned by grant
print("Deleting leagues...")
League.objects.filter(captain__in=[grant, judy, buddy]).delete()

# Delete friendships
print("Deleting friendships...")
Friendship.objects.filter(user__in=[grant, judy, buddy]).delete()
Friendship.objects.filter(friend__in=[grant, judy, buddy]).delete()

# Delete notifications
print("Deleting notifications...")
Notification.objects.filter(user__in=[grant, judy, buddy]).delete()

# Delete league invites
print("Deleting league invites...")
LeagueInvite.objects.filter(to_user__in=[grant, judy, buddy]).delete()
LeagueInvite.objects.filter(league__captain__in=[grant, judy, buddy]).delete()

# Delete all events and bets
print("Clearing existing events and bets...")
LeagueEvent.objects.filter(league__captain__in=[grant, judy, buddy]).delete()

# Create friendships
print("Creating friendships...")
Friendship.objects.create(user=grant, friend=judy)
Friendship.objects.create(user=judy, friend=grant)
Friendship.objects.create(user=grant, friend=buddy)
Friendship.objects.create(user=buddy, friend=grant)

# Create a league with Grant as captain
print("Creating league for Grant...")
league = League.objects.create(
    name="Grant's Test League",
    description="A test league for demonstration purposes",
    sports=["American Football", "Basketball", "Baseball"],
    captain=grant
)

# Add members to the league
league.members.add(grant)  # Captain is always a member
league.members.add(judy)
league.members.add(buddy)

print("Setup complete!")
print(f"League '{league.name}' created with ID: {league.id}")
print(f"Users: grant, judy, buddy (passwords match usernames)")
EOF

echo "Test profiles have been reset!"
echo "Grant, Judy, and Buddy now have 0 points and \$1000.00 each."
echo "Grant has a league with Judy and Buddy as members."
echo "Each user's password is set to their username (all lowercase)."

# Restart the React app to clear cached session data
echo "Restarting React app to clear cached user data..."
docker compose restart react-app

echo "IMPORTANT: You must log out and log back in to see your updated balance!"
echo "After logging in again, your balance will show the correct \$1000.00 amount." 