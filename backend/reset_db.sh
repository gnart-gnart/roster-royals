#!/bin/bash

echo "Removing database..."
rm -f db.sqlite3

echo "Removing old migrations..."
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

echo "Making new migrations..."
python manage.py makemigrations users
python manage.py makemigrations groups

echo "Applying migrations..."
python manage.py migrate auth
python manage.py migrate users
python manage.py migrate groups
python manage.py migrate authtoken
python manage.py migrate

echo "Creating superuser..."
DJANGO_SUPERUSER_USERNAME=admin \
DJANGO_SUPERUSER_EMAIL=admin@example.com \
DJANGO_SUPERUSER_PASSWORD=admin123 \
python manage.py createsuperuser --noinput

echo "Creating test users and friendships..."
python manage.py shell -c "
from users.models import User, Friendship;

# Create users
judy = User.objects.create_user(username='judy', email='judy@example.com', password='judy');
grant = User.objects.create_user(username='grant', email='grant@example.com', password='grant');
buddy = User.objects.create_user(username='buddy', email='buddy@example.com', password='buddy');

# Create friendships (both directions needed)
Friendship.objects.create(user=judy, friend=grant);
Friendship.objects.create(user=grant, friend=judy);
Friendship.objects.create(user=buddy, friend=grant);
Friendship.objects.create(user=grant, friend=buddy);
"

echo "Database reset complete!"
echo "You can now login with:"
echo "Admin - username: admin, password: admin123"
echo "Test Users:"
echo "- username: judy, password: judy"
echo "- username: grant, password: grant"
echo "- username: buddy, password: buddy"
echo "Friendships created: judy-grant, buddy-grant"