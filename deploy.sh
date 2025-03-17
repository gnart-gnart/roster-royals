#!/bin/bash

# Stop script on first error
set -e

# Create directories for certificates and static files
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p backend/static
mkdir -p backend/media

# Check if certificates need to be copied from the host system
if [ ! -d "certbot/conf/live/rosterroyals.com" ] && [ -d "/etc/letsencrypt/live/rosterroyals.com" ]; then
  echo "🔑 Using existing certificates from host system..."
  # Copy the entire letsencrypt directory
  cp -r /etc/letsencrypt/* certbot/conf/
fi

# Skip certificate generation if they already exist
if [ ! -d "certbot/conf/live/rosterroyals.com" ]; then
  echo "🔑 Certificates not found, obtaining new SSL certificate..."
  
  # Start nginx temporarily for certificate validation
  docker compose -f docker-compose.prod.yml up -d nginx
  
  # Wait for nginx to start
  sleep 5
  
  # Get SSL certificate
  docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot -w /var/www/certbot \
    --email your-email@example.com \
    -d rosterroyals.com -d www.rosterroyals.com \
    --agree-tos --no-eff-email
    
  # Stop the temporary nginx
  docker compose -f docker-compose.prod.yml stop nginx
fi

echo "🚀 Starting all services..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment complete! Site available at https://rosterroyals.com"