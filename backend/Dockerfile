# Stage 1: Build stage - Install dependencies including build tools
FROM python:3.11 AS builder

# Install build essentials if needed (e.g., for packages that compile C extensions)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies into the virtual environment
# Copy only requirements first to leverage Docker cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Collect static files (might need dependencies installed)
# Note: This collects into /app/staticfiles within this builder stage
RUN python manage.py collectstatic --noinput

# Stage 2: Final stage - Minimal Python environment
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy the application code (excluding potentially large build artifacts)
COPY --from=builder /app .

# Copy collected static files from builder stage
COPY --from=builder /app/staticfiles ./staticfiles

# Make sure the venv python is used
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port Django runs on
EXPOSE 8000

# Set the default command to run Gunicorn in production
# Assumes Gunicorn is installed in the venv
CMD ["gunicorn", "roster_royals.wsgi:application", "--bind", "0.0.0.0:8000"]


# ----- Remove old single-stage content -----
# # Use official Python image as base
# FROM python:3.11
#
# # Set working directory inside container
# WORKDIR /app
#
# # Set build arguments
# ARG ENVIRONMENT=development
# ENV ENVIRONMENT=${ENVIRONMENT}
#
# # Copy project files first
# COPY . .
#
# # Install dependencies (Now requirements.txt exists)
# RUN pip install --no-cache-dir -r requirements.txt
#
# # Remove chmod for deleted script
# # RUN chmod +x db_init.sh
#
# # Collect static files during build
# RUN python manage.py collectstatic --noinput
#
# # Expose the port Django runs on
# EXPOSE 8000
#
# # Run gunicorn directly in production, remove db_init.sh execution
# CMD if [ "$ENVIRONMENT" = "production" ]; then \
#         gunicorn roster_royals.wsgi:application --bind 0.0.0.0:8000; \
#     else \
#         # For development, run runserver (db_init.sh could be optionally run manually if needed for dev setup)
#         python manage.py runserver 0.0.0.0:8000; \
#     fi
#
# # python manage.py runserver 0.0.0.0:8000" 
