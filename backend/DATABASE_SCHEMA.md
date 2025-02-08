# Database Schema Documentation

## Models Overview

### User Model
Extends Django's AbstractUser model to add custom functionality.

```python
class User(AbstractUser):
    points = models.IntegerField(default=1000)
    friends = models.ManyToManyField('self', through='Friendship', symmetrical=True, blank=True)
```

### Friendship Model
Manages user friendships and prevents self-friendships.

```python
class Friendship(models.Model):
    user = models.ForeignKey(User, related_name='friendships')
    friend = models.ForeignKey(User, related_name='friend_of')
    created_at = models.DateTimeField(auto_now_add=True)
```

### FriendRequest Model
Handles friend request functionality between users.

```python
class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests')
    to_user = models.ForeignKey(User, related_name='received_requests')
    status = models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')])
    created_at = models.DateTimeField(auto_now_add=True)
```

### BettingGroup Model
Manages betting groups and their members.

```python
class BettingGroup(models.Model):
    name = models.CharField(max_length=100)
    sport = models.CharField(max_length=50)
    president = models.ForeignKey(User, related_name='owned_betting_groups')
    members = models.ManyToManyField(User, related_name='betting_groups')
    created_at = models.DateTimeField(auto_now_add=True)
```

### GroupInvite Model
Handles group invitation functionality.

```python
class GroupInvite(models.Model):
    group = models.ForeignKey(BettingGroup, related_name='invites')
    to_user = models.ForeignKey(User, related_name='group_invites')
    status = models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')])
    created_at = models.DateTimeField(auto_now_add=True)
```

### Bet Model
Represents individual bets within a group.

```python
class Bet(models.Model):
    group = models.ForeignKey(BettingGroup, related_name='bets')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)  # spread, moneyline, over/under
    points = models.IntegerField()
    status = models.CharField(choices=[('open', 'Open'), ('closed', 'Closed'), ('settled', 'Settled')])
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
```

### UserBet Model
Tracks users' bets and their outcomes.

```python
class UserBet(models.Model):
    user = models.ForeignKey(User, related_name='bets')
    bet = models.ForeignKey(Bet, related_name='user_bets')
    choice = models.CharField(max_length=50)
    points_wagered = models.IntegerField()
    result = models.CharField(choices=[('pending', 'Pending'), ('won', 'Won'), ('lost', 'Lost')])
    created_at = models.DateTimeField(auto_now_add=True)
```

### Notification Model
Handles system notifications for users.

```python
class Notification(models.Model):
    user = models.ForeignKey(User, related_name='notifications')
    message = models.CharField(max_length=255)
    notification_type = models.CharField(choices=[
        ('friend_request', 'Friend Request'),
        ('friend_accepted', 'Friend Request Accepted'),
        ('group_invite', 'Group Invitation'),
        ('info', 'Information')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    requires_action = models.BooleanField(default=False)
```

## SQL Schema

### users_user
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| password | varchar(128) | NOT NULL |
| last_login | datetime | NULL |
| is_superuser | bool | NOT NULL |
| username | varchar(150) | NOT NULL, UNIQUE |
| first_name | varchar(150) | NOT NULL |
| last_name | varchar(150) | NOT NULL |
| email | varchar(254) | NOT NULL |
| is_staff | bool | NOT NULL |
| is_active | bool | NOT NULL |
| date_joined | datetime | NOT NULL |
| points | integer | NOT NULL, DEFAULT 1000 |

### users_friendship
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| created_at | datetime | NOT NULL |
| user_id | integer | NOT NULL, REFERENCES users_user(id) |
| friend_id | integer | NOT NULL, REFERENCES users_user(id) |

### users_friendrequest
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| created_at | datetime | NOT NULL |
| status | varchar(20) | NOT NULL |
| from_user_id | integer | NOT NULL, REFERENCES users_user(id) |
| to_user_id | integer | NOT NULL, REFERENCES users_user(id) |

### groups_bettinggroup
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| name | varchar(100) | NOT NULL |
| sport | varchar(50) | NOT NULL |
| created_at | datetime | NOT NULL |
| president_id | integer | NOT NULL, REFERENCES users_user(id) |

### groups_bettinggroup_members
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| bettinggroup_id | integer | NOT NULL, REFERENCES groups_bettinggroup(id) |
| user_id | integer | NOT NULL, REFERENCES users_user(id) |

### groups_groupinvite
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| created_at | datetime | NOT NULL |
| status | varchar(20) | NOT NULL |
| group_id | integer | NOT NULL, REFERENCES groups_bettinggroup(id) |
| to_user_id | integer | NOT NULL, REFERENCES users_user(id) |

### groups_bet
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| name | varchar(200) | NOT NULL |
| type | varchar(50) | NOT NULL |
| points | integer | NOT NULL |
| status | varchar(20) | NOT NULL |
| created_at | datetime | NOT NULL |
| deadline | datetime | NOT NULL |
| group_id | integer | NOT NULL, REFERENCES groups_bettinggroup(id) |

### groups_userbet
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| choice | varchar(50) | NOT NULL |
| points_wagered | integer | NOT NULL |
| result | varchar(20) | NOT NULL |
| created_at | datetime | NOT NULL |
| bet_id | integer | NOT NULL, REFERENCES groups_bet(id) |
| user_id | integer | NOT NULL, REFERENCES users_user(id) |

### users_notification
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PRIMARY KEY AUTOINCREMENT |
| message | varchar(255) | NOT NULL |
| notification_type | varchar(50) | NOT NULL |
| created_at | datetime | NOT NULL |
| is_read | bool | NOT NULL |
| requires_action | bool | NOT NULL |
| user_id | integer | NOT NULL, REFERENCES users_user(id) |

### authtoken_token
| Column | Type | Constraints |
|--------|------|-------------|
| key | varchar(40) | PRIMARY KEY |
| created | datetime | NOT NULL |
| user_id | integer | NOT NULL, UNIQUE, REFERENCES users_user(id) |

## Relationships Overview
```
users_user
┌──────────────┐
│ id           │
│ username     │1────────────┐
│ password     │1──────┐     │
│ email        │1────┐ │     │
│ points       │1──┐ │ │     │
└──────────────┘   │ │ │     │
                   │ │ │     │
users_friendship   │ │ │     │
┌──────────────┐   │ │ │     │
│ id           │   │ │ │     │
│ created_at   │   │ │ │     │
│ user_id      │───┘ │ │     │
│ friend_id    │─────┘ │     │
└──────────────┘       │     │
                       │     │
users_friendrequest    │     │
┌──────────────┐       │     │
│ id           │       │     │
│ created_at   │       │     │
│ status       │       │     │
│ from_user_id │───────┘     │
│ to_user_id   │─────────────┤
└──────────────┘             │
                            │
groups_bettinggroup         │
┌──────────────┐            │
│ id           │            │
│ name         │            │
│ sport        │            │
│ president_id │────────────┤
└──────────────┘            │
        │                   │
        │   ┌───────────────┘
        │   │
groups_groupinvite  groups_bettinggroup_members
┌──────────────┐    ┌──────────────┐
│ id           │    │ id           │
│ created_at   │    │ group_id     │────┐
│ status       │    │ user_id      │────┤
│ group_id     │────┘              │    │
│ to_user_id   │─────────────────────┐ │
└──────────────┘                     │ │
                                    │ │
groups_bet                          │ │
┌──────────────┐                    │ │
│ id           │                    │ │
│ name         │                    │ │
│ type         │                    │ │
│ points       │                    │ │
│ status       │                    │ │
│ deadline     │                    │ │
│ group_id     │────────────────────┘ │
└──────────────┘                      │
        │                             │
        │                             │
groups_userbet                        │
┌──────────────┐                      │
│ id           │                      │
│ choice       │                      │
│ points       │                      │
│ result       │                      │
│ bet_id       │──────┐               │
│ user_id      │──────────────────────┘
└──────────────┘      │
                      │
users_notification    │
┌──────────────┐      │
│ id           │      │
│ message      │      │
│ type         │      │
│ is_read      │      │
│ requires_action     │
│ user_id      │──────┘
└──────────────┘
```

### Key Relationships
- One-to-Many (1:N):
  - User → Friendships (as both user and friend)
  - User → FriendRequests (as both sender and receiver)
  - User → Notifications
  - User → UserBets
  - BettingGroup → Bets
  - BettingGroup → GroupInvites
  - Bet → UserBets
  - User → Owned BettingGroups (as president)

- Many-to-Many (M:N):
  - Users ↔ Users (through Friendships)
  - Users ↔ BettingGroups (through group membership)

- One-to-One (1:1):
  - User ↔ AuthToken

### Cascade Behavior
- Deleting a User cascades to:
  - All their friendships
  - All their friend requests
  - All their notifications
  - All their group invites
  - All their bets
  - Their auth token
  - Their group memberships
  - Groups they preside over

- Deleting a BettingGroup cascades to:
  - All its bets
  - All its invites
  - All member associations

- Deleting a Bet cascades to:
  - All associated user bets

### Constraints Summary
- All foreign keys have corresponding indexes
- Unique constraints:
  - users_user: username
  - users_friendship: (user_id, friend_id)
  - users_friendrequest: (from_user_id, to_user_id)
  - groups_groupinvite: (group_id, to_user_id)
  - groups_userbet: (user_id, bet_id)
  - authtoken_token: user_id
- All datetime fields are stored in UTC
- All boolean fields default to false unless specified 