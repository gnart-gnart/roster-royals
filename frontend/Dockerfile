# Use a smaller Node.js base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Add build arguments
ARG REACT_APP_API_URL
ARG ENVIRONMENT=development
ARG NODE_ENV=production
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV NODE_ENV=${NODE_ENV}

# Install dependencies
RUN npm install --legacy-peer-deps && \
    npm install react-image-crop@latest

# Copy the rest of the application
COPY . .

# Create .cache directory with proper permissions
RUN mkdir -p /app/node_modules/.cache && chmod -R 777 /app/node_modules/.cache

# Force PUBLIC_URL to root for correct asset paths
ENV PUBLIC_URL=/

# If in production mode, build the static files
RUN if [ "$ENVIRONMENT" = "production" ]; then \
        npm run build; \
    fi

# Install serve for production or use development server
RUN if [ "$ENVIRONMENT" = "production" ]; then \
        npm install -g serve; \
    fi

# Expose the app port
EXPOSE 3000

# Start the appropriate server based on environment
CMD if [ "$ENVIRONMENT" = "production" ]; then \
        serve -s build -l 3000 --single -n; \
    else \
        npm start; \
    fi
