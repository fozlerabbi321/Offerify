# Offerify Backend

> NestJS 11 API server with Fastify, TypeORM, and PostgreSQL/PostGIS.

---

## 🚀 Quick Start

### Using Makefile (Recommended)

From the **project root**:
```bash
make setup       # Install deps, start DBs, run migrations, seed
make dev-backend # Run backend in dev mode
```

### Manual Setup

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start development
npm run start:dev
```

**API:** http://localhost:3000/api  
**Swagger:** http://localhost:3000/offerify-api-docs

---

## 📁 Project Structure

```
src/
├── config/           # Environment configuration
├── common/           # Shared interceptors, guards, decorators
├── domain/           # TypeORM entities
├── features/         # Feature modules
│   ├── auth/         # Authentication (JWT)
│   ├── location/     # Countries, States, Cities
│   ├── categories/   # Offer categories
│   ├── vendors/      # Vendor profiles
│   ├── shops/        # Shop management
│   ├── offers/       # Offers, Coupons, Vouchers
│   ├── redemptions/  # QR code redemptions
│   ├── engagement/   # Favorites, Reviews
│   ├── media/        # File uploads
│   └── admin/        # Admin endpoints
└── migrations/       # TypeORM migrations
```

---

## 🧪 Testing

```bash
npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run start:prod` | Production mode |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:generate` | Generate new migration |
| `npm run seed` | Seed database |

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `offerify_db` |
| `JWT_SECRET` | JWT signing key | - |
| `JWT_EXPIRATION` | Token expiry | `7d` |
| `FRONTEND_URL` | CORS origin (production) | - |

---

## 🚢 Deployment (Railway)

1. Create PostgreSQL database using **PostGIS template**
2. Deploy from GitHub with root directory `backend`
3. Set environment variables
4. Build command: `npm run build && npm run migration:run`
5. Start command: `npm run start:prod`

---

## 📚 API Documentation

Visit `/offerify-api-docs` for interactive Swagger documentation.

### Response Format

All responses follow this structure:

```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1 },
  "message": "Success"
}
```
