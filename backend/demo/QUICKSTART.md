# Roster Royals Demo Quickstart

## Setup
```
docker-compose exec django-web python manage.py setup_demo
```

## Accounts
| Username | Password | Role |
|----------|----------|------|
| slowpoke | password123 | League Captain |
| miles | password123 | League Member |
| gwen | password123 | League Member |
| pikachu | password123 | Invited User |

## Demo Scenarios

### 1. Complete Circuit (as slowpoke)
- Complete Team Battle event (select "Team Galactic")
- Complete Lebron tiebreaker event (enter "24")
- See tiebreaker resolution:
  - miles wins (guessed 25, closest to 24)

### 2. New Participant (as pikachu)
- Accept league invitation
- Join circuit
- Place bets

## Reset Demo
```
docker-compose exec django-web python manage.py setup_demo
``` 