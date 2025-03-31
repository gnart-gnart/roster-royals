#!/bin/bash

# Script to switch between development and production environments

# Help message
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: ./switch_env.sh [development|production]"
    echo "Switch between development and production environments by modifying the .env file."
    exit 0
fi

# Check if the environment argument is provided
if [ -z "$1" ]; then
    echo "Error: Please specify an environment (development or production)."
    echo "Usage: ./switch_env.sh [development|production]"
    exit 1
fi

# Validate the environment argument
if [ "$1" != "development" ] && [ "$1" != "production" ]; then
    echo "Error: Invalid environment. Use 'development' or 'production'."
    echo "Usage: ./switch_env.sh [development|production]"
    exit 1
fi

# Set the environment
ENV=$1

# Update the .env file
if grep -q "^ENVIRONMENT=" .env; then
    # Replace the existing ENVIRONMENT variable
    sed -i.bak "s/^ENVIRONMENT=.*/ENVIRONMENT=$ENV/" .env
else
    # Add the ENVIRONMENT variable at the top if it doesn't exist
    sed -i.bak "1s/^/ENVIRONMENT=$ENV\n/" .env
fi

# Clean up the backup file
rm -f .env.bak

echo "Environment switched to $ENV."

# Get environment-specific values from the .env file
DEV_URL=$(grep "^DEV_URL=" .env | cut -d '=' -f2)
PROD_URL=$(grep "^PROD_URL=" .env | cut -d '=' -f2)
DEV_HOST=$(grep "^DEV_HOST=" .env | cut -d '=' -f2)
PROD_HOST=$(grep "^PROD_HOST=" .env | cut -d '=' -f2)
DEV_DEBUG=$(grep "^DEV_DEBUG=" .env | cut -d '=' -f2)
PROD_DEBUG=$(grep "^PROD_DEBUG=" .env | cut -d '=' -f2)

# Update direct environment variables
if [ "$ENV" == "production" ]; then
    # Set SERVER_IP to production value
    if grep -q "^SERVER_IP=" .env; then
        sed -i.bak "s|^SERVER_IP=.*|SERVER_IP=$PROD_HOST|" .env
    fi

    # Set DEBUG to false
    if grep -q "^DEBUG=" .env; then
        sed -i.bak "s|^DEBUG=.*|DEBUG=$PROD_DEBUG|" .env
    fi

    # Set REACT_APP_API_URL to production value
    if grep -q "^REACT_APP_API_URL=" .env; then
        sed -i.bak "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL=$PROD_URL/api|" .env
    fi

    # Define the production volumes setting
    VOLUMES_SETTING="ENVIRONMENT_VOLUMES=./frontend/build:/app/build"
    
    # Check if ENVIRONMENT_VOLUMES is already set in .env
    if grep -q "^ENVIRONMENT_VOLUMES=" .env; then
        # Update the setting
        sed -i.bak "s|^ENVIRONMENT_VOLUMES=.*|$VOLUMES_SETTING|" .env
    else
        # Add the setting
        echo "$VOLUMES_SETTING" >> .env
    fi
    
    # Set NODE_ENV to production
    if grep -q "^NODE_ENV=" .env; then
        sed -i.bak "s/^NODE_ENV=.*/NODE_ENV=production/" .env
    fi
    
    # Clean up the backup file
    rm -f .env.bak
    
    echo "Production settings configured."
else
    # Set SERVER_IP to development value
    if grep -q "^SERVER_IP=" .env; then
        sed -i.bak "s|^SERVER_IP=.*|SERVER_IP=$DEV_HOST|" .env
    fi

    # Set DEBUG to true
    if grep -q "^DEBUG=" .env; then
        sed -i.bak "s|^DEBUG=.*|DEBUG=$DEV_DEBUG|" .env
    fi

    # Set REACT_APP_API_URL to development value
    if grep -q "^REACT_APP_API_URL=" .env; then
        sed -i.bak "s|^REACT_APP_API_URL=.*|REACT_APP_API_URL=$DEV_URL/api|" .env
    fi

    # For development, remove ENVIRONMENT_VOLUMES if it exists
    if grep -q "^ENVIRONMENT_VOLUMES=" .env; then
        grep -v "^ENVIRONMENT_VOLUMES=" .env > .env.tmp && mv .env.tmp .env
    fi
    
    # Set NODE_ENV to development
    if grep -q "^NODE_ENV=" .env; then
        sed -i.bak "s/^NODE_ENV=.*/NODE_ENV=development/" .env
        rm -f .env.bak
    fi
    
    echo "Development settings configured."
fi

echo "Run 'docker compose down && docker compose up --build -d' to apply changes." 