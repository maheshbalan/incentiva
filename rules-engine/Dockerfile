FROM node:21.7.3-alpine

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
COPY shared/ /app/shared/
COPY rules-engine/ /app/rules-engine/
COPY backend/prisma/ /app/rules-engine/prisma/

# Copy TypeScript configuration files (after source to avoid overwriting)
COPY shared/tsconfig.json /app/shared/
COPY rules-engine/tsconfig.json /app/rules-engine/

# Copy pre-built shared package (built outside container)
COPY shared/dist/ /app/shared/dist/

# Debug: List files to see what was copied
RUN ls -la /app/rules-engine/
RUN ls -la /app/shared/
RUN find /app -name "tsconfig.json" -type f
RUN ls -la /app/rules-engine/src/
RUN ls -la /app/rules-engine/prisma/

# Build rules engine
WORKDIR /app/rules-engine
RUN npx tsc -p tsconfig.json

# Generate Prisma client
RUN npx prisma generate

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

# Start the application (use dev mode for development)
CMD ["npm", "run", "dev"]
