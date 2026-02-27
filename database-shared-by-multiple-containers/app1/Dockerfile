# ============================================
# Dockerfile for Node.js App 1
# ============================================
# This file tells Docker how to build our Node.js app

# Use official Node.js image (LTS version)
FROM node:18-alpine

# Create app directory in container
WORKDIR /usr/src/app

# Copy package.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port 3000 inside container
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
