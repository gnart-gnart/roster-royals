# Roster Royals Demo Guide

## Setup Instructions

1. Make sure the application is running with Docker:
   ```
   docker-compose up -d
   ```

2. Run the demo setup script:
   ```
   docker-compose exec web python manage.py setup_demo
   ```

## Demo Flow

### 1. User Accounts
- **Pre-created accounts:**
  - Username: `slowpoke` (League Captain)
  - Username: `miles` (League Member)
  - Username: `gwen` (League Member)
  - Username: `pikachu` (Will be invited)
- All accounts use password: `password123`

### 2. League Structure
The demo creates:
- A league called "Demo League" with slowpoke as captain and miles, gwen as members
- A circuit called "Demo Circuit" with a $25 entry fee
- Four events with different states:
  - "Rockets vs. Warriors Game 3" (completed, weight 2)
  - "Grizzlies vs. Thunder Game 2" (completed, weight 1)
  - "How many points will Lebron score tonight?" (upcoming, tiebreaker, weight 1)
  - "Who will win tonight's game? Team Rocket or Team Galactic" (upcoming, weight 3)

### 3. Current Standings
- gwen: 3 points (won both completed events)
- miles: 2 points (won Warriors game)
- slowpoke: 1 point (won Thunder game)

### 4. Demo Scenarios

#### Complete Circuit with Tiebreaker
1. Log in as `slowpoke` (the captain)
2. Navigate to the Demo Circuit page
3. Complete the Team Rocket vs Team Galactic event:
   - Select "Team Galactic" as the winner
   - This will give miles 3 more points (total: 5)
   - Gwen and slowpoke will still have 3 and 1 points respectively
4. Complete the Lebron tiebreaker event:
   - Enter "24" as the tiebreaker value
   - System will determine the winner based on closest guess:
     - slowpoke: 28 (difference: 4)
     - miles: 25 (difference: 1)
     - gwen: 22 (difference: 2)
   - Miles will win with the smallest difference

#### Add a New Participant
1. Log in as `pikachu`
2. Accept the pending league invitation
3. Join the Demo Circuit
4. Place bets on the upcoming events

## Notes
- All users start with $1000
- The circuit has an entry fee of $25
- Prize pool for the circuit is $75 (3 participants × $25)

## Reset Demo
To reset the demo at any point, simply run the setup script again:
```
docker-compose exec web python manage.py setup_demo
``` 