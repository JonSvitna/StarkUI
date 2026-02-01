# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY backend/src ./src

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
