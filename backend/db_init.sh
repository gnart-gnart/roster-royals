#!/bin/bash

echo "Removing database..."
rm -f db.sqlite3

echo "Removing old migrations..."
find users/migrations -name "*.py" -not -name "__init__.py" -delete
find groups/migrations -name "*.py" -not -name "__init__.py" -delete

echo "Making new migrations..."
python3 manage.py makemigrations users
python3 manage.py makemigrations groups

echo "Applying migrations..."
python3 manage.py migrate auth
python3 manage.py migrate users  # Apply users migrations first
python3 manage.py migrate groups  # Then groups
python3 manage.py migrate  # Finally any remaining migrations

echo "Collecting static files..."
python3 manage.py collectstatic --noinput

echo "Creating test users and relationships..."
python3 manage.py shell << END
from users.models import User, Friendship, Notification
from groups.models import BettingGroup, GroupInvite

# Create admin superuser
print("Creating admin superuser...")
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin',
    is_staff=True,
    is_superuser=True
)

# Create test users
print("Creating test users...")
judy = User.objects.create_user(username='judy', email='judy@example.com', password='judy')
grant = User.objects.create_user(username='grant', email='grant@example.com', password='grant')
buddy = User.objects.create_user(username='buddy', email='buddy@example.com', password='buddy')

# Create friendships
print("Creating friendships...")
Friendship.objects.create(user=judy, friend=grant)
Friendship.objects.create(user=grant, friend=judy)
Friendship.objects.create(user=buddy, friend=grant)
Friendship.objects.create(user=grant, friend=buddy)

# Update points
print("Setting user points...")
judy.points = 1200
grant.points = 1500
buddy.points = 1100
judy.save()
grant.save()
buddy.save()

# Create a test group
print("Creating test group...")
test_group = BettingGroup.objects.create(
    name="Test Betting Group",
    description="A group for testing various sports betting",
    sports=["NFL", "NBA"],  # Now supports multiple sports
    president=grant
)
test_group.members.add(grant)

# Test notification
print("Creating test notification...")
Notification.objects.create(
    user=judy,
    message="Test notification",
    notification_type='info',
    is_read=False
)

print("Database setup complete!")
END

echo "Database reset complete!"
echo "You can now login with:"
echo "Admin interface (http://localhost:8000/admin):"
echo "- username: admin, password: admin"
echo ""
echo "Test Users:"
echo "- username: judy, password: judy (1200 points)"
echo "- username: grant, password: grant (1500 points)"
echo "- username: buddy, password: buddy (1100 points)"
echo "Friendships created: judy-grant, buddy-grant"
echo "Test group created with grant as president"
echo "Test notification created for judy"
