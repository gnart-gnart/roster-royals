# Backend Documentation

This directory contains the Django backend for the Roster Royals application. It handles the server-side logic, database interactions, and API endpoints.

## Structure

- **`roster_royals/`**: Core Django project settings and configurations.
  - **`settings.py`**: Main settings file for the Django project.
  - **`urls.py`**: URL routing for the project.
  - **`wsgi.py`**: WSGI configuration for deployment.
  - **`asgi.py`**: ASGI configuration for asynchronous support.

- **`users/`**: Handles user authentication, profiles, and related features.
  - **`models.py`**: User model and related models.
  - **`views.py`**: API views for user-related operations.
  - **`serializers.py`**: Serializers for user data.
  - **`urls.py`**: URL routing for user-related endpoints.

- **`groups/`**: Manages betting leagues, bets, and related features.
  - **`models.py`**: Models for leagues and bets.
  - **`views.py`**: API views for league-related operations.
  - **`serializers.py`**: Serializers for league data.
  - **`urls.py`**: URL routing for league-related endpoints.
  - **`odds.py`**: Integration with the Odds API for sports data.

- **`db_init.sh`**: Script for initializing the database with test data.

- **`requirements.txt`**: Python dependencies for the backend.

## Development

### Prerequisites

- **Python**: Ensure you have Python installed on your machine.
- **PostgreSQL**: The backend uses PostgreSQL as the database.

### Running Locally

1. **Install Dependencies**

   Navigate to the `backend` directory and install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**

   Ensure you have a `.env` file with the necessary environment variables. This file is not included in the repository for security reasons.

3. **Database Setup**

   Run the database initialization script to set up the database and create test data:

   ```bash
   ./db_init.sh
   ```

4. **Start the Development Server**

   Start the Django development server:

   ```bash
   python manage.py runserver
   ```

   This will start the application on [http://localhost:8000](http://localhost:8000).

## Docker

The backend can also be run in a Docker container. Use the following command to build and run the container:

```bash
docker build -t roster-royals-backend .
docker run -p 8000:8000 roster-royals-backend
```

## Environment Variables

The application uses environment variables defined in a `.env` file. Ensure the following variables are set:

- **`DJANGO_SECRET_KEY`**: Secret key for Django.
- **`POSTGRES_DB`**: Name of the PostgreSQL database.
- **`POSTGRES_USER`**: PostgreSQL username.
- **`POSTGRES_PASSWORD`**: PostgreSQL password.
- **`ODDS_API_KEY`**: API key for the Odds API integration.

## Testing

The backend uses Django's testing framework. To run tests, use:

```bash
python manage.py test
```

## Contributing

When contributing to the backend, please ensure:

- Code is linted and follows Django best practices.
- New models are placed in the appropriate app directory.
- New API endpoints are added to the relevant `views.py` and `urls.py` files.
- Database migrations are created and applied as needed. 