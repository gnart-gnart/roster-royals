# Roster Royals

## Overview
Roster Royals is a social sports betting platform where users can:
- Create and join betting groups with friends
- Track points and compete on leaderboards
- Send and accept friend requests
- Receive notifications for friend requests and group invites

## Tech Stack
- **Frontend**: React.js with Material-UI
- **Backend**: Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: Token-based authentication

Roster Royals is a sports betting application that allows users to join groups, place bets, and track their performance. This README provides instructions for setting up the project locally and documentation for the app's components and structure.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: npm is included with Node.js. Verify installation by running `npm -v` in your terminal.
- **Python**: Python 3.8 or higher is required for the backend
- **pip**: Python package manager
- **virtualenv**: For creating Python virtual environments

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/roster-royals.git
   cd roster-royals
   ```

2. **Environment Setup**:
   Create a `.env` file in the backend directory:
   ```bash
   cd backend
   echo "CLOUDBET_API_KEY=<your_api_key_here>" > .env
   cd ..
   ```
   You must get your own API key.

3. **Install Dependencies**:
   Backend Setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ./reset_db.sh  # This will create test users: judy, grant, and buddy
   ```

   Frontend Setup:
   ```bash
   cd ../
   npm install
   ```

4. **Run the Application**:
   Start the backend server:
   ```bash
   cd backend
   python manage.py runserver
   ```

   In a new terminal, start the frontend:
   ```bash
   npm start
   ```

   This will start the development server and open the app in your default web browser at `http://localhost:3000`.

### Test Users
After running reset_db.sh, you can log in with these test accounts:
- username: judy, password: judy
- username: grant, password: grant
- username: buddy, password: buddy
- Admin account: username: admin, password: admin123

## App Structure

- **public/**: Contains static files like `index.html`.
- **src/**: Contains all the source code for the application.
  - **components/**: Reusable React components.
  - **pages/**: Page components for different routes.
  - **services/**: API service functions for interacting with the backend.
  - **App.js**: Main application component that sets up routing and theming.
  - **index.js**: Entry point of the application.

## Pages

### LoginPage

- **Path**: `/`
- **Description**: Allows users to log in or register. Utilizes Google authentication.
- **Components Used**: `TextField`, `Button`, `Alert`, `Typography`.

### HomePage

- **Path**: `/home`
- **Description**: Displays user's groups and friends. Allows creating new groups and adding friends.
- **Components Used**: `GroupCard`, `NavBar`, `List`, `Button`.

### GroupPage

- **Path**: `/group/:id`
- **Description**: Shows details of a specific group, including members and available bets.
- **Components Used**: `Table`, `Dialog`, `Button`, `NavBar`.

### CreateGroupPage

- **Path**: `/create-group`
- **Description**: Allows users to create a new group.
- **Components Used**: `TextField`, `Button`, `Stepper`, `Card`.

### AddFriendPage

- **Path**: `/add-friend`
- **Description**: Enables users to add new friends to their list.
- **Components Used**: `TextField`, `Button`, `List`, `Card`.

## Components

### NavBar

- **Description**: Navigation bar that appears on all pages.
- **Props**: None.

### GroupCard

- **Description**: Displays a summary of a group, including its name, sport, and member count.
- **Props**: `name`, `sport`, `memberCount`, `onClick`.

### FriendsList

- **Description**: Displays a list of friends with options to invite to groups or remove.
- **Props**: `friends`, `groups`, `onFriendRemoved`.

### ProtectedRoute

- **Description**: A higher-order component that protects routes from unauthorized access.
- **Props**: `children`.

## API Endpoints

#### Authentication

- **POST** `/api/login/`: Log in a user.
- **POST** `/api/register/`: Register a new user.

#### Friends

- **GET** `/api/friends/`: Retrieve a list of friends.
- **POST** `/api/friend-request/send/:userId/`: Send a friend request.
- **GET** `/api/friend-requests/`: Retrieve friend requests.
- **POST** `/api/friend-request/:requestId/handle/`: Handle a friend request (accept/reject).
- **POST** `/api/friends/remove/:friendId/`: Remove a friend.

#### Groups

- **POST** `/api/groups/create/`: Create a new group.
- **POST** `/api/groups/:groupId/add-member/:userId/`: Add a member to a group.
- **GET** `/api/groups/`: Retrieve a list of groups the user is a member of.
- **POST** `/api/groups/:groupId/invite/:userId/`: Invite a user to a group.
- **POST** `/api/group-invites/:inviteId/handle/`: Handle a group invite (accept/reject).

#### Users

- **GET** `/api/users/search/`: Search for users.

#### Notifications

- **GET** `/api/notifications/`: Retrieve notifications.
- **POST** `/api/notifications/mark-read/`: Mark notifications as read.

## Database Schema

For detailed information on the database schema, please refer to the [Database Schema Documentation](backend/DATABASE_SCHEMA.md).

### Common Issues
1. **Database Errors**:
   If you encounter database errors, try resetting it:
   ```bash
   cd backend
   ./reset_db.sh
   ```

2. **Token Authentication Errors**:
   - Make sure you're logged in
   - Check if token exists in localStorage
   - Try logging out and back in

3. **CORS Issues**:
   Backend is configured to accept requests from `localhost:3000`

### Project Structure
```
roster-royals/
├── backend/
│   ├── users/           # User management, authentication, friendships
│   ├── groups/          # Betting groups and invitations
│   └── roster_royals/   # Django project settings
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   └── services/    # API integration
    └── public/          # Static assets
```

### API Endpoints
- Authentication:
  - POST /api/login/
  - POST /api/register/

- Users & Friends:
  - GET /api/friends/
  - POST /api/friend-request/send/{user_id}/
  - POST /api/friend-request/{request_id}/handle/

- Groups:
  - GET /api/groups/
  - POST /api/groups/create/
  - POST /api/groups/{group_id}/invite/{user_id}/

- Notifications:
  - GET /api/notifications/
  - POST /api/notifications/mark-read/

## Database Models

### Users
- User: Extended Django user model with points system
- Friendship: Manages user friend relationships
- FriendRequest: Handles friend request flow
- Notification: System notifications and alerts

### Groups
- BettingGroup: Main group model for betting functionality
- GroupInvite: Manages group invitations
- Bet: Individual bets within a group
- UserBet: User's bets and results

### System Tables
- Group: Django's built-in auth group model (not used in application, but required by Django's authentication system)
- Other Django system tables (auth, sessions, etc.)

Note: While the Django Group model exists in the database for authentication purposes, our application uses the custom BettingGroup model for all betting group functionality.

---

This README provides a comprehensive overview of the Roster Royals application, including setup instructions and component documentation. For further details, please refer to the source code and comments within the project.