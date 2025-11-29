# Deployment Guide

This document outlines the deployment strategy for Offerify, focusing on Docker containerization and environment configuration.

## 1. Prerequisites

- **Docker** & **Docker Compose** installed.
- **Node.js** (v20+) for local development.
- **PostgreSQL** (v16+) with **PostGIS** extension enabled.

## 2. Environment Variables

Create a `.env` file in the `backend/` directory.

```env
# App
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=offerify_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Typesense
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=xyz_api_key
TYPESENSE_PROTOCOL=http

# JWT / Auth
JWT_SECRET=super_secret_key
JWT_EXPIRATION=1d
```

## 3. Docker Deployment

We use a multi-stage `Dockerfile` to optimize image size.

### Build & Run (Production Mode)

```bash
# From backend directory
docker build -t offerify-backend .
docker run -p 3000:3000 --env-file .env offerify-backend
```

### Local Development (Docker Compose)

We provide a `docker-compose.yml` to spin up dependencies (Postgres, Redis, Typesense).

```bash
# Start dependencies
docker-compose up -d

# Stop dependencies
docker-compose down
```

## 4. Database Migrations

**Always** run migrations before starting the application in production.

```bash
# Run migrations
npm run migration:run
```

## 5. Seeding Data

For initial setup, seed the location data:

```bash
npm run seed:location
```

## 6. Health Checks

The application exposes a health check endpoint (if configured, usually `/health` or `/api/health`).
Ensure your load balancer checks this endpoint.
