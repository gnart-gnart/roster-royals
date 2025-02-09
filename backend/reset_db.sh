#!/bin/bash

echo "Removing database..."
rm -f db.sqlite3

echo "Removing old migrations..."
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

echo "Making new migrations..."
python manage.py makemigrations users
python manage.py makemigrations groups

echo "Applying migrations..."
python manage.py migrate

echo "Creating test users and relationships..."
python manage.py shell << END
from users.models import User, Friendship, Notification
from groups.models import BettingGroup, GroupInvite

# Create test users
print("Creating test users...")
judy = User.objects.create_user(username='judy', email='judy@example.com', password='judy')
grant = User.objects.create_user(username='grant', email='grant@example.com', password='grant')
buddy = User.objects.create_user(username='buddy', email='buddy@example.com', password='buddy')

# Create admin user
print("Creating admin user...")
User.objects.create_superuser(username='admin', email='admin@example.com', password='admin123')

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
    sport="NFL",
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
echo "Admin - username: admin, password: admin123"
echo "Test Users:"
echo "- username: judy, password: judy (1200 points)"
echo "- username: grant, password: grant (1500 points)"
echo "- username: buddy, password: buddy (1100 points)"
echo "Friendships created: judy-grant, buddy-grant"
echo "Test group created with grant as president"
echo "Test notification created for judy"