FROM node:22-alpine

# Use Node.js 22 on lightweight Alpine Linux
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend application files
COPY . .

# Application listens on port 5000
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
