# Roster Royals

Roster Royals is a web application that allows users to create and manage sports betting leagues with friends. This README provides instructions for setting up the development environment, running the application locally, and understanding the production deployment process.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Docker**: Install the latest version from [Docker's official site](https://www.docker.com/products/docker-desktop).
- **Docker Compose**: This is usually included with Docker Desktop.

## Getting Started: Local Development

Follow these steps to run the application on your local machine for development and testing.

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/gnart-gnart/roster-royals.git # Replace with your repo URL if different
    cd roster-royals
    ```

2.  **Local Environment Configuration (`.env`)**

    - Create a file named `.env` in the root directory of the cloned project.
    - **Important:** This file should **NOT** be committed to Git. Add `.env` to your `.gitignore` file if it's not already there.
    - Populate this file with environment variables suitable for **local development**. See the example below:

    ```dotenv
    # Example local .env file (not used anywhere)

    # --- Core Settings ---
    ENVIRONMENT=development
    DEBUG=True
    # Use a DIFFERENT secret key than production! Generate a new one.
    DJANGO_SECRET_KEY=local_secret_key_put_something_random_here
    REACT_APP_API_URL=http://localhost/api # Nginx proxy route for API
    SERVER_IP=localhost # For Nginx development template

    # --- Database (Local instance via Docker) ---
    POSTGRES_USER=username
    POSTGRES_PASSWORD=your_local_db_password # Use a local password
    POSTGRES_HOST=pgdb # Docker service name
    POSTGRES_PORT=5432 # Internal container port
    POSTGRES_DB=roster_royals

    # --- Ports (Map container ports to local host ports) ---
    DJANGO_PORT=8000 # Example: Localhost:8000 maps to Django container port 8000 (less relevant when using Nginx proxy)
    REACT_PORT=3000 # Example: Localhost:3000 maps to React dev server port 3000
    NGINX_HTTP_PORT=80 # Example: Localhost:80 maps to Nginx container port 80

    # --- Node Environment ---
    NODE_ENV=development

    # --- API Keys (Use test/dev keys or leave blank if functionality not needed locally) ---
    ODDS_API_KEY=your_dev_api_key_here
    GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id_for_localhost.apps.googleusercontent.com # Use localhost credentials
    GOOGLE_OAUTH2_CLIENT_SECRET=your_local_google_client_secret

    # --- Other Dev/Prod Vars (Mainly illustrative, ENVIRONMENT controls behavior) ---
    DEV_URL=http://localhost
    PROD_URL=https://rosterroyals.com
    DEV_HOST=localhost
    PROD_HOST=your_production_ip # Doesn't affect local dev run
    DEV_DEBUG=True
    PROD_DEBUG=False

    # --- Docker Compose Ports (Internal container ports, consistent with above) ---
    POSTGRES_CONTAINER_PORT=5432
    DJANGO_CONTAINER_PORT=8000
    REACT_CONTAINER_PORT=3000
    ```

3.  **Build and Run Containers (Initial Setup)**

    Use Docker Compose to build the images (if they don't exist or Dockerfiles changed) and start the containers in detached mode. For local development, **only** use the base `docker-compose.yml` file.

    ```bash
    # Run from the project root directory
    docker compose -f docker-compose.yml up --build -d
    ```

4.  **Database Setup (First Time / Model Changes)**

    After the containers are running, set up the database:

    ```bash
    # Apply database migrations
    docker compose exec django-web python manage.py migrate

    # Optional: Create a superuser for Django admin access
    docker compose exec django-web python manage.py createsuperuser

    # Optional: Run the test user reset script (if you have it)
    # docker compose exec django-web python reset_test_users.py
    ```
    *(Note: `db_init.sh` is no longer used).*

5.  **Access the Application**

    Open your web browser and navigate to `http://localhost` (or `http://localhost:PORT` if you changed `NGINX_HTTP_PORT` in your local `.env`).

    - The frontend should load, served by the React development server with hot-reloading.
    - API calls from the frontend will be proxied by Nginx to the Django backend.

## Local Development Workflow

-   **Starting Containers:** `docker compose -f docker-compose.yml up -d`
-   **Stopping Containers:** `docker compose -f docker-compose.yml down`
-   **Viewing Logs:** `docker compose logs -f` or `docker compose logs -f <service_name>` (e.g., `django-web`, `react-app`)
-   **Applying Backend Migrations:** `docker compose exec django-web python manage.py migrate`
-   **Running Backend Commands:** `docker compose exec django-web python manage.py <command>`
-   **Frontend Changes:** Edit files in the `frontend/src` directory. The React dev server uses hot-reloading, so changes should appear automatically in your browser.
-   **Backend Changes:** Edit files in the `backend` directory. Django's development server will typically auto-reload for most Python changes. For changes requiring a full restart (like installing new packages), use `docker compose restart django-web`.

## Rebuilding After Code Changes (Local Development)

-   **Frontend (`package.json` changes):** If you add/remove npm packages:
    ```bash
    docker compose build react-app
    docker compose up -d # Restarts containers with the new image
    ```
-   **Backend (`requirements.txt` changes):** If you add/remove Python packages:
    ```bash
    docker compose build django-web
    docker compose up -d # Restarts containers with the new image
    ```
-   **Dockerfile Changes:** If you modify `frontend/Dockerfile` or `backend/Dockerfile`:
    ```bash
    docker compose up --build -d # Rebuilds and restarts all services
    ```
-   **Nginx Config Changes:** If you modify Nginx templates (`nginx/*.template`):
    ```bash
    docker compose build nginx
    docker compose up -d # Restarts containers with the new image
    ```
-   **Code-Only Changes (Frontend/Backend):** Usually, no rebuild is needed due to volume mounts and hot-reloading/auto-reloading dev servers. If something seems stuck, try restarting the specific service: `docker compose restart react-app` or `docker compose restart django-web`.

## Production Deployment (via GitHub Actions)

Production deployment is automated via a GitHub Actions workflow (`.github/workflows/deploy.yml`) triggered by pushes to the `main` branch. **Manual deployment steps are generally not required.**

The workflow performs the following steps on the production server (DigitalOcean Droplet) via SSH:

1.  Pulls the latest code from the `main` branch.
2.  Stops all running application containers (`docker compose down`).
3.  Removes the `roster-royals_react_build` volume to ensure a clean frontend build.
4.  Starts the `pgdb` (database) and `django-web` containers.
5.  Executes database migrations (`docker compose exec django-web python manage.py migrate`).
6.  Builds fresh Docker images **on the droplet** using `docker compose build --no-cache`. This uses the droplet's resources and the `.env` file located at `/root/roster-royals/.env` on the server.
7.  Starts all application containers (`docker compose up -d`) using the newly built images.

The production environment uses:
- The `.env` file located on the server (containing production secrets, database credentials, and `ENVIRONMENT=production`).
- Optimized multi-stage Docker builds.
- Gunicorn to serve the Django application.
- `serve` to serve the static React build.
- Nginx configured for HTTPS (via Let's Encrypt certificates mounted into the container) and reverse proxying.

## API Integration

Roster Royals uses the Odds API for sports data. An API key should be set in the relevant `.env` file as `ODDS_API_KEY`. Google OAuth also requires client ID and secret configuration in the `.env` file.

## Troubleshooting

-   **Disk Space Errors During Build (Local or Production):** Docker builds can consume significant disk space. Run `docker system prune -a` to remove unused containers, networks, images, and build cache. Be cautious with `--volumes` flag if you have important data in non-database volumes.
-   **CORS errors:** Ensure `REACT_APP_API_URL` in the relevant `.env` file (`http://localhost/api` for local dev, `https://yourdomain.com` for production build) is correct. Check Nginx and Django CORS configurations if issues persist.
-   **Mixed Content Errors:** Ensure `REACT_APP_API_URL` used during the frontend build correctly uses `https://` for production. The current workflow handles this by building on the droplet using the production `.env` file.

## Contributing

Please follow this workflow:

1.  Create a new branch for your feature or bugfix.
2.  Commit your changes and push to your branch.
3.  Submit a pull request with a description of your changes.

**Note**: If you are contributing by adding a feature, you can create issues on the project page here: https://github.com/users/gnart-gnart/projects/1.