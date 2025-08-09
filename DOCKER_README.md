# Incentiva.me - Docker Setup

This document explains how to run the Incentiva.me application using Docker containers.

## Architecture

- **Frontend**: React application built and served from the backend container
- **Backend**: Node.js API server with static file serving
- **Database**: PostgreSQL in a separate container
- **Orchestration**: Docker Compose

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- Git repository cloned

### 2. Development with Database Only

If you want to develop locally but use containerized PostgreSQL:

```bash
# Start only PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Update backend/.env to point to localhost:5432
DATABASE_URL="postgresql://incentiva:incentiva@localhost:5432/incentiva_dev"

# Run development servers
npm run dev
```

### 3. Full Containerized Application

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### 4. Access the Application

- **Application**: http://localhost:3001
- **Database**: localhost:5432
- **Admin Login**: incentiva-admin@incentiva.me / exatatech

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:build` | Build Docker images |
| `npm run docker:up` | Start all services in background |
| `npm run docker:down` | Stop all services |
| `npm run docker:restart` | Restart services |
| `npm run docker:logs` | View service logs |
| `npm run docker:clean` | Clean up containers and volumes |

## Development Workflow

### 1. Make Changes

Edit your code in the respective directories:
- `frontend/` - React application
- `backend/` - Node.js API
- `shared/` - Shared TypeScript types

### 2. Rebuild and Deploy

```bash
# Rebuild the application container
npm run docker:build

# Restart the application
npm run docker:restart app

# View logs to check deployment
npm run docker:logs
```

### 3. Database Operations

```bash
# Access the database container
docker exec -it incentiva-postgres psql -U incentiva -d incentiva_dev

# Run migrations (from within app container)
docker exec -it incentiva-app npx prisma migrate deploy

# Seed the database
docker exec -it incentiva-app npx prisma db seed
```

## Environment Variables

The application uses these key environment variables:

- `NODE_ENV`: production/development
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `PORT`: Application port (default: 3001)

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker-compose logs app

# Check database connection
docker-compose logs postgres
```

### Database Connection Issues

```bash
# Ensure PostgreSQL is healthy
docker-compose ps

# Reset database
npm run docker:clean
npm run docker:up
```

### Frontend Not Loading

The frontend is built into the backend container. If you see issues:

1. Check that the build completed successfully in the Docker logs
2. Verify that static files are being served from `/app/public`
3. Check that the backend is serving on the correct port

### Clear Everything and Start Fresh

```bash
# Stop and remove all containers, networks, and volumes
npm run docker:clean

# Rebuild from scratch
npm run docker:build
npm run docker:up
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use proper JWT secrets and database credentials
3. Consider using the nginx service for SSL termination
4. Set up proper logging and monitoring

```bash
# Use production profile with nginx
docker-compose --profile production up -d
```