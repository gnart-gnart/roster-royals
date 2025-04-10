# Stage 1: Build the React application
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
# Add build arguments needed for build stage
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
# Use npm ci for reliable installs
RUN npm ci && \
    npm install react-image-crop@latest

# Copy the rest of the application source code
COPY . .

# Build the application
# Note: PUBLIC_URL is set here, NODE_ENV=production is default for npm run build
RUN PUBLIC_URL=/ npm run build

# Stage 2: Serve the built application using a minimal Node server
FROM node:16-alpine

WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy only the build output from the builder stage
COPY --from=builder /app/build ./build

# Expose the default port for 'serve'
EXPOSE 3000

# Start 'serve' to serve the build directory
# CMD serves the build folder, listens on 3000, handles SPA routing (-s), and disables printing network interfaces (-n)
CMD ["serve", "-s", "build", "-l", "3000", "-n"]
