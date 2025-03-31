# Use official Python image as base
FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Set build arguments
ARG ENVIRONMENT=development
ENV ENVIRONMENT=${ENVIRONMENT}

# Copy project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make the reset script executable
RUN chmod +x db_init.sh

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port Django runs on
EXPOSE 8000

# Run db_init.sh and start Django server
CMD if [ "$ENVIRONMENT" = "production" ]; then \
        ./db_init.sh && gunicorn roster_royals.wsgi:application --bind 0.0.0.0:8000; \
    else \
        ./db_init.sh && python manage.py runserver 0.0.0.0:8000; \
    fi

# python manage.py runserver 0.0.0.0:8000" 
