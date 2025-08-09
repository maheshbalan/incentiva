# Multi-stage build for Node.js backend with React frontend
FROM node:21-alpine AS frontend-builder

# Set working directory for frontend build
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

# Install dependencies for shared and frontend
WORKDIR /app/shared
RUN npm install

WORKDIR /app/frontend
RUN npm install

# Copy source code
COPY shared/ /app/shared/
COPY frontend/ /app/frontend/

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Backend stage
FROM node:21-alpine AS backend

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy workspace configuration first
COPY package*.json ./

# Copy shared package
COPY shared/ ./shared/

# Copy backend
COPY backend/ ./backend/

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Install workspace dependencies
RUN npm install

# Skip TypeScript build for now, use source directly
WORKDIR /app/backend
# RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Keep dev dependencies for ts-node
WORKDIR /app
# RUN npm prune --production && npm cache clean --force

# Create necessary directories and set permissions
RUN mkdir -p /app/backend/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set working directory to backend for runtime
WORKDIR /app/backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start command (use dev mode with ts-node)
CMD ["npm", "run", "dev"]