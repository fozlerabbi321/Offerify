# Makefile Commands Reference

## Quick Reference

```bash
make help          # Show all available commands
make setup         # Complete setup (recommended for first time)
make dev           # Start full development environment
make test          # Run tests
make docker-prod   # Deploy production stack
```

---

## Development Commands

### `make setup`
**Complete initial setup workflow**

Runs the following steps automatically:
1. Creates `.env` files from examples if missing
2. Installs npm dependencies (backend + frontend)
3. Starts Docker services (PostgreSQL, Redis, Typesense)
4. Runs database migrations
5. Seeds database with initial data

**When to use:**
- First time setup
- After pulling fresh code
- After database reset

---

### `make dev`
**Start full development environment**

Executes:
1. `make setup` (if not already done)
2. `make test` (ensures code quality)
3. Starts backend and frontend concurrently with live logs

**Output:**
```
BACKEND  | [Nest] Starting Nest application...
FRONTEND | Starting Expo web server...
```

**Ports:**
- Backend: http://localhost:3000
- Frontend: http://localhost:8081

**Tip:** Use `Ctrl+C` to stop both servers

---

### `make dev-backend`
**Run only backend**

Useful when:
- Working on API development
- Frontend is not needed
- Debugging backend issues

---

### `make dev-frontend`
**Run only frontend**

Useful when:
- Working on UI development
- Backend is stable
- Testing design changes

---

## Testing Commands

### `make test`
**Run backend test suite**

Executes:
- Unit tests (`npm test`)
- E2E tests (`npm run test:e2e`)

**Requirements:**
- Database must be running (`make docker-up`)

---

## Docker Commands

### `make docker-up`
**Start infrastructure services only**

Starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Typesense (port 8108)

Does NOT start backend/frontend applications.

---

### `make docker-prod`
**Build and deploy production stack**

Creates optimized Docker builds:
- Multi-stage backend container
- Static frontend with Nginx

**Access:**
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3000/api

**Note:** This uses `docker-compose.prod.yml` and requires production environment variables.

---

### `make docker-prod-down`
**Stop production stack**

Stops all production containers without removing volumes.

---

### `make logs`
**View development Docker logs**

Shows live logs from PostgreSQL, Redis, and Typesense.

---

### `make logs-prod`
**View production Docker logs**

Shows live logs from all production containers (including backend and frontend).

---

## Maintenance Commands

### `make clean`
**Complete cleanup**

Removes:
- Docker containers and volumes
- `node_modules` directories
- Build artifacts (`dist/`, `.expo/`)
- `.env` files

**Warning:** This is destructive! You will lose:
- All database data
- Installed dependencies
- Local environment configuration

**Use when:**
- Starting completely fresh
- Resolving dependency conflicts
- Freeing up disk space

---

### `make migrate`
**Run database migrations**

Applies pending migrations to the database.

**When to use:**
- After pulling code with new migrations
- Manual migration execution

---

### `make seed`
**Seed database**

Populates database with initial data (categories, demo users, etc.).

---

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different ports in .env
BACKEND_PORT=3001
FRONTEND_PORT=8082
```

### "Database connection failed"
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Wait for health check
docker-compose ps
```

### "Dependencies not found"
```bash
# Re-install
make clean
make setup
```

### "Migrations failed"
```bash
# Reset database
docker-compose down -v
make setup
```

---

## Workflow Examples

### First Time Setup
```bash
git clone <repo>
cd offerify
make setup
make dev
```

### Daily Development
```bash
make dev  # Starts everything
```

### Backend-Only Work
```bash
make docker-up
make dev-backend
```

### Pull Latest Code
```bash
git pull
make setup  # Re-runs migrations
make dev
```

### Production Deployment
```bash
cp .env.example .env
# Edit .env with production values
make docker-prod
```
