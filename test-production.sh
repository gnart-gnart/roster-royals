#!/bin/bash
# test-production.sh

# Create necessary directories
mkdir -p backend/static
mkdir -p backend/media

# Create a temporary .env file for testing production locally
cp .env.prod .env.test
# Update the API URL to use localhost instead of the domain
sed -i '' 's|https://rosterroyals.com/api|http://localhost/api|g' .env.test
# Change SERVER_IP to localhost
sed -i '' 's|SERVER_IP=rosterroyals.com|SERVER_IP=localhost|g' .env.test

# Use the temporary environment file with the production docker-compose
echo "🧪 Testing production configuration locally..."
export $(grep -v '^#' .env.test | xargs)

# Use production docker-compose but with local nginx config (without SSL)
# Create temporary nginx config without SSL
cat > nginx/nginx.local.conf << EOL
server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
        proxy_pass http://react-app:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    # Backend
    location /api/ {
        proxy_pass http://django-web:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # CORS headers
        add_header Access-Control-Allow-Origin '*';
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
        
        if (\$request_method = OPTIONS) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
}
EOL

# Start the services with modified config
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "✅ Local production test environment is running"
echo "🌐 You can access it at http://localhost"
echo "⚠️  To stop the test, run: docker compose -f docker-compose.prod.yml down"