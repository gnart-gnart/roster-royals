#!/bin/bash

# Note: Make sure to remove the docker volume from the host before running this script using:
# docker compose down -v

echo "Starting database initialization..."

# Optionally removing old migrations...
# Uncomment the following lines if you want to remove old migrations:
# find users/migrations -name "*.py" -not -name "__init__.py" -delete
# find groups/migrations -name "*.py" -not -name "__init__.py" -delete

echo "Making new migrations..."
python3 manage.py makemigrations

echo "Applying migrations..."
python3 manage.py migrate

# Create default league image
echo "Creating default league image..."
python3 manage.py create_default_league_image

# Instead of dropping groups tables via shell (which may cause conflicts when using a fresh DB),
# reset the groups migration state and re-run migrations for groups.

echo "Resetting groups migrations..."
python3 manage.py migrate groups zero --fake
python3 manage.py migrate groups

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

# Creating test users and relationships...
python3 manage.py shell << 'END'
from users.models import User, Friendship
from groups.models import League
from rest_framework.authtoken.models import Token

# Delete existing tokens
Token.objects.all().delete()

# Delete existing test users if they exist
User.objects.filter(username__in=['admin', 'judy', 'grant', 'buddy']).delete()

# Create admin superuser
admin = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin',
    is_staff=True,
    is_superuser=True,
    money=1000.00  # $1000 starting balance
)
print("Admin superuser created.")

# Create regular test users
judy = User.objects.create_user(
    username='judy',
    email='judy@example.com',
    password='judy',
    money=1000.00  # $1000 starting balance
)
grant = User.objects.create_user(
    username='grant',
    email='grant@example.com',
    password='grant',
    money=1000.00  # $1000 starting balance
)
buddy = User.objects.create_user(
    username='buddy',
    email='buddy@example.com',
    password='buddy',
    money=1000.00  # $1000 starting balance
)
print("Test users created.")

# Clear any existing friendships and create new ones
Friendship.objects.all().delete()
Friendship.objects.create(user=judy, friend=grant)
Friendship.objects.create(user=grant, friend=judy)
Friendship.objects.create(user=buddy, friend=grant)
Friendship.objects.create(user=grant, friend=buddy)
print("Friendships created.")

# Clear any existing leagues and create a new one
League.objects.all().delete()
test_league = League.objects.create(
    name="Test League",
    description="A league for testing various sports betting",
    sports=["NFL", "NBA"],
    captain=grant
)
test_league.members.add(grant)
print("Test league created.")

print("Database setup complete!")
END

echo "Database reset complete!"
echo "You can now login with:"
echo "Admin superuser: username: admin, password: admin"
echo "Test Users:"
echo " - judy: password judy"
echo " - grant: password grant"
echo " - buddy: password buddy"