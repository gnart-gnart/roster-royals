# Roster Royals

Roster Royals is a web application that allows users to create and manage betting groups. This README provides instructions for setting up the development environment and running the application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Docker**: Install the latest version from [Docker's official site](https://www.docker.com/products/docker-desktop).
- **Docker Compose**: This is included with Docker Desktop, but ensure it's up to date.

## Getting Started

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/roster-royals.git
   cd roster-royals
   ```

2. **Environment Configuration**

   You will need a `.env` file with the necessary environment variables. This file is not included in the repository for security reasons. Please contact the project maintainer to obtain it.

3. **Build and Run the Application**

   Use Docker Compose to build and run the application:

   ```bash
   docker compose up --build
   ```

   This command will build the Docker images and start the containers for the backend (Django), frontend (React), and Nginx proxy.

4. **Access the Application**

   Once the containers are running, you can access the application in your web browser at:

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/api](http://localhost:8000/api)

## Development Workflow

- **Frontend (React)**: The React application is located in the `frontend` directory. You can add new components, pages, and services here. The application will automatically reload when you make changes.

- **Backend (Django)**: The Django application is located in the `backend` directory. You can add new models, views, and serializers here. Use Django's management commands to apply migrations and manage the database.

## Testing

- **Frontend Testing**: Use React's built-in testing library to write and run tests for your components.

- **Backend Testing**: Use Django's testing framework to write and run tests for your views and models.

## Troubleshooting

- If you encounter issues with Docker, try restarting Docker Desktop or running `docker system prune` to clean up unused resources.

- For CORS issues, ensure your `.env` file is correctly configured with the appropriate API URL.

## Contributing

Please follow this workflow:

1. Create a new branch for your feature or bugfix.
2. Commit your changes and push to your branch.
3. Submit a pull request with a description of your changes.
