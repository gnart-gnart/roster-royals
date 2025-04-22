# Stage 1: Build the React application
FROM node:16-alpine AS builder

WORKDIR /app

# Create directory with proper permissions and ownership
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Switch to node user for npm operations
USER node

# Copy package files first to leverage Docker caching
COPY --chown=node:node package*.json ./

# Add build arguments needed for build stage
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Install dependencies with ci and cache options for faster installs
RUN npm ci --prefer-offline --no-audit --progress=false && \
    npm install react-image-crop@latest --no-audit --progress=false

# Copy only necessary source files
COPY --chown=node:node public ./public
COPY --chown=node:node src ./src

# Build the application with optimizations
RUN PUBLIC_URL=/ GENERATE_SOURCEMAP=false npm run build

# Stage 2: Create a minimal production image
FROM node:16-alpine AS production

WORKDIR /app

# Create directory with proper permissions and ownership
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Install serve globally (needed for production)
RUN npm install -g serve

# Switch to node user for app execution
USER node

# Copy only the build output from builder stage
COPY --from=builder --chown=node:node /app/build ./build

# Skip copying node_modules in production image
# COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Expose the default port
EXPOSE 3000

# Production-only command
CMD ["serve", "-s", "build", "-l", "3000", "-n"]

# Stage 3: Development image (only used in development mode)
FROM node:16-alpine AS development

WORKDIR /app

# Create directory with proper permissions and ownership
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Switch to node user for npm operations
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Copy necessary source files from builder
COPY --chown=node:node public ./public
COPY --chown=node:node src ./src

# Don't install all dependencies in the image - mount them at runtime
# to speed up build time and use the host node_modules volume

# Expose the development port
EXPOSE 3000

# Development command
CMD ["npm", "start"]

# Final stage selection based on build arg
FROM ${NODE_ENV:-production} AS final

# Expose port
EXPOSE 3000

# Command based on environment
CMD if [ "$NODE_ENV" = "production" ] ; then \
      # Production: Serve static build files
      serve -s build -l 3000 -n ; \
    else \
      # Development: Run the React development server
      npm start ; \
    fi
