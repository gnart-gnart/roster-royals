# Use an official Node.js runtime as a base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker cache)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 3000

# Run the app in development mode
CMD ["npm", "start"]
