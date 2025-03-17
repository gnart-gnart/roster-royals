#!/bin/bash
# test-production-fixed.sh

# Create necessary directories
mkdir -p backend/static
mkdir -p backend/media
mkdir -p certbot/conf
mkdir -p certbot/www

# Create temporary nginx config for local testing
cat > nginx/nginx.local.conf << EOL
server {
    listen 80;
    
    # Frontend
    location / {
        proxy_pass http://react-app:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Backend
    location /api/ {
        proxy_pass http://django-web:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # CORS headers
        add_header Access-Control-Allow-Origin '*';
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    }
}
EOL

# Create a modified docker-compose file for local testing
cat > docker-compose.test.yml << EOL
services:
  pgdb:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network
      
  django-web:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - pgdb
    environment:
      DATABASE_URL: postgres://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@\${POSTGRES_HOST}:\${POSTGRES_PORT}/\${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_HOST: \${POSTGRES_HOST}
      POSTGRES_PORT: \${POSTGRES_PORT}
      POSTGRES_DB: \${POSTGRES_DB}
      DJANGO_SECRET_KEY: \${DJANGO_SECRET_KEY}
      DEBUG: 'True'
    volumes:
      - ./backend:/app
    networks:
      - app_network

  react-app:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost/api
    restart: always
    depends_on:
      - django-web
    environment:
      NODE_ENV: development
    networks:
      - app_network
  
  nginx:
    image: nginx:latest
    container_name: nginx_proxy
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.local.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - react-app
      - django-web
    networks:
      - app_network

volumes:
  postgres_data:

networks:
  app_network:
    driver: bridge
EOL

echo "🧪 Starting test environment..."
docker compose -f docker-compose.test.yml up -d --build

echo "✅ Test environment is running. Wait a moment for services to initialize."
echo "🌐 Access the application at http://localhost"
echo "⚠️  To stop the test, run: docker compose -f docker-compose.test.yml down"