# 🎯 Offerify

[![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-SDK_53-blue?logo=expo)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-blue?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 📋 Overview

Offerify connects customers with local businesses through location-based deals, coupons, and vouchers. Vendors can create shops, post offers, and track redemptions while customers discover deals in their city.

### Key Features

- 🗺️ **Location-based Discovery** - Find deals near you using PostGIS
- 🏪 **Multi-shop Support** - Vendors can manage multiple shop locations
- 🎫 **Unified Offers** - Discounts, Coupons, and Vouchers in one system
- 📱 **Cross-platform** - Web, iOS, and Android from single codebase
- 🔐 **Role-based Access** - Customer, Vendor, and Admin roles

---

## 🏗️ Project Structure

```
offerify/
├── backend/          # NestJS API server
├── frontend/         # Expo (React Native) app
├── docs/             # Documentation
└── docker-compose.yml
```

| Directory | Description |
|-----------|-------------|
| [backend/](./backend) | NestJS 11 + Fastify + TypeORM + PostgreSQL/PostGIS |
| [frontend/](./frontend) | Expo SDK 53 + React Native + React Native Web |
| [docs/](./docs) | Architecture, API docs, and development guides |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Make

### One-Command Setup

```bash
git clone https://github.com/your-username/offerify.git
cd offerify

# Complete setup: install deps, start DBs, run migrations, seed data
make setup
```

### Start Development

```bash
# Run full stack (backend + frontend)
make dev

# Or run separately
make dev-backend   # Backend only
make dev-frontend  # Frontend only
```

**Access:**
- Backend API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/offerify-api-docs
- Frontend Web: http://localhost:8081

---

## 🧪 Testing

```bash
make test-unit   # Run unit tests
make test-e2e    # Run E2E tests
make test        # Run all tests
```

---

## � Makefile Commands

| Command | Description |
|---------|-------------|
| `make setup` | Complete setup (env + install + DBs + migrations + seed) |
| `make dev` | Run full stack (backend + frontend) |
| `make dev-backend` | Run backend only |
| `make dev-frontend` | Run frontend only |
| `make test` | Run all tests (unit + E2E) |
| `make test-unit` | Run unit tests only |
| `make test-e2e` | Run E2E tests only |
| `make clean` | Stop Docker and clean artifacts |
| `make docker-prod` | Build and run production Docker stack |
| `make help` | Show all available commands |

---

## �🚢 Deployment

| Service | Platform |
|---------|----------|
| Backend | [Railway.com](https://railway.com) |
| Frontend | [Vercel](https://vercel.com) |
| Database | Railway PostgreSQL (PostGIS template) |

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 📚 Documentation

- [System Architecture](./docs/architecture/SYSTEM_DESIGN.md)
- [API Structure](./docs/API_STRUCTURE.md)
- [Code Style Guide](./docs/development/code-style.md)
- [Quality Checklist](./docs/development/quality-checklist.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11, Fastify, TypeORM |
| **Database** | PostgreSQL + PostGIS |
| **Frontend** | Expo SDK 53, React Native, React Native Web |
| **State** | Zustand, TanStack Query |
| **Testing** | Jest, React Native Testing Library |

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
