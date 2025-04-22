# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Create directory with proper permissions and ownership
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Switch to node user for npm operations
USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
# Add build arguments needed for build stage
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
# Use npm ci for reliable installs
RUN npm ci && \
    npm install react-image-crop@latest

# Copy the rest of the application source code
COPY --chown=node:node . .

# Build the application (only for production use in final stage)
RUN PUBLIC_URL=/ npm run build

# Stage 2: Serve the built application OR run dev server
FROM node:16-alpine

WORKDIR /app

# Create directory with proper permissions and ownership
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Install 'serve' globally (needed for production)
RUN npm install -g serve

# Switch to node user for app execution
USER node

# Copy the build output from the builder stage (for production)
COPY --from=builder --chown=node:node /app/build ./build

# --- For Development Server --- 
# Copy necessary source files and dependencies from builder
# This allows running 'npm start' without reinstalling in the final stage
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/src ./src
# ----------------------------

# Expose the default port
EXPOSE 3000

# Check environment variable passed from docker-compose to decide command
# Use NODE_ENV as create-react-app uses this convention
CMD if [ "$NODE_ENV" = "production" ] ; then \
      # Production: Serve static build files
      serve -s build -l 3000 -n ; \
    else \
      # Development: Run the React development server (watches mounted volumes)
      npm start ; \
    fi
