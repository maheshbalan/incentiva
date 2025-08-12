FROM node:21-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY rules-engine/package*.json ./rules-engine/

# Install dependencies
WORKDIR /app/shared
RUN npm install

WORKDIR /app/rules-engine
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY rules-engine/ ./rules-engine/

# Build shared package
WORKDIR /app/shared
RUN npm run build

# Build rules engine
WORKDIR /app/rules-engine
RUN npm run build

# Create logs directory
RUN mkdir -p /app/logs && \
    mkdir -p /app/rules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["npm", "start"]
