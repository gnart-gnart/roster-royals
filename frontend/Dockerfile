# Use a smaller Node.js base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps --prefer-offline --no-audit

# Remove any existing build directory if present (to ensure a clean build)
RUN rm -rf build

# Copy the rest of the application
COPY . .

# Build the React app for production
RUN npm run build

# Install `serve` to serve the static files
RUN npm install -g serve

# Expose the app port
EXPOSE 3000

# Start the production server
CMD ["serve", "-s", "build", "-l", "3000", "--single", "-n"]
