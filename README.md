
# Roster Royals

A social sports betting platform where users can create groups, add friends, and compete using a points-based system.

## Project Structure

The project follows this directory structure:

```bash
roster-royals/
├── backend/                 # Django backend
│   ├── roster_royals/      # Main Django project
│   ├── users/              # User authentication and friends
│   ├── groups/             # Betting groups and bets
│   └── manage.py           # Django management script
└── src/                    # React frontend
    ├── components/         # Reusable UI components
    ├── pages/              # Page components
    └── services/           # API integration
```

## Backend (Django)

### Key Models

- **User**: Extended Django user model with points and friends
- **FriendRequest**: Manages friend connections between users
- **BettingGroup**: Groups where users can create and participate in bets
- **Bet**: Individual betting opportunities within a group
- **UserBet**: Records of users' bets and their outcomes

### API Endpoints

```bash
POST /api/register/              # Create new user account
POST /api/login/                 # Authenticate user
GET  /api/friends/               # Get user's friends
POST /api/friend-request/<id>/   # Send friend request
GET  /api/groups/                # Get user's groups
POST /api/groups/create/         # Create new betting group
```

## Frontend (React)

### Key Components

- **HomePage**: Dashboard showing user's groups and friends
- **GroupPage**: Group details, available bets, and leaderboard
- **CreateGroupPage**: Multi-step form for creating new groups
- **GroupCard**: Reusable component for displaying group information

### State Management

- Uses React's built-in state management with useState and useEffect
- JWT tokens stored in localStorage for authentication
- API service layer in `services/api.js` handles all backend communication

## Getting Started

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Running the Application

1. Start the Django server:
```bash
cd backend
python manage.py runserver
```

2. Start the React development server (in another terminal):
```bash
npm start
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin interface: http://localhost:8000/admin/

## Development Workflow

1. **Authentication**
   - Register or login to access the platform
   - Authentication handled via Django Token authentication

2. **Groups**
   - Create betting groups for specific sports
   - Add friends as group members
   - View group leaderboard and available bets

3. **Friends**
   - Send and accept friend requests
   - View friends list
   - Add friends to betting groups

## Environment Setup

Create a `.env` file in the backend directory:

```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test your changes
4. Submit a pull request

## Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: Token-based authentication
