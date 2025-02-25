# Use official Python image as base
FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make the reset script executable
RUN chmod +x db_init.sh

# Expose the port Django runs on
EXPOSE 8000

# Run db_init.sh and start Django server
CMD ["sh", "-c", "./db_init.sh && gunicorn roster_royals.wsgi:application --bind 0.0.0.0:8000"]

# python manage.py runserver 0.0.0.0:8000" 
