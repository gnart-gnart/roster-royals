# Use official Python image as base
FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Set build arguments
ARG ENVIRONMENT=development
ENV ENVIRONMENT=${ENVIRONMENT}

# Copy project files first
COPY . .

# Install dependencies (Now requirements.txt exists)
RUN pip install --no-cache-dir -r requirements.txt

# Remove chmod for deleted script
# RUN chmod +x db_init.sh

# Collect static files during build
RUN python manage.py collectstatic --noinput

# Expose the port Django runs on
EXPOSE 8000

# Run gunicorn directly in production, remove db_init.sh execution
CMD if [ "$ENVIRONMENT" = "production" ]; then \
        gunicorn roster_royals.wsgi:application --bind 0.0.0.0:8000; \
    else \
        # For development, run runserver (db_init.sh could be optionally run manually if needed for dev setup)
        python manage.py runserver 0.0.0.0:8000; \
    fi

# python manage.py runserver 0.0.0.0:8000" 
