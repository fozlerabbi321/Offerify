# Offerify Backend - Geo-Aware Deal Engine

A production-grade **NestJS** API designed for high-performance, hyper-local deal discovery. Built with a strict **TDD** workflow, **PostGIS** for geospatial logic, and **Typesense** for search.

## ✨ Key Features

  - **NestJS 11** with **Fastify** adapter (High Performance).
  - **PostgreSQL 16+** with **PostGIS** extension for location logic.
  - **Global CSC Architecture** (Country \> State \> City/Zone) logic.
  - **Single Table Inheritance** for Offers, Coupons, and Vouchers.
  - **Typesense** integration for typo-tolerant search.
  - **Redis** for Feed caching and Session management.
  - **Strict TDD Workflow** (Red-Green-Refactor).
  - **Automated Seeding** for Location hierarchies (Bangladesh Context).

-----

## 🚀 Quick Start

### Prerequisites (Local Machine)

Since we are **not** using Docker yet, ensure you have these installed locally:

  - **Node.js** \>= 20
  - **PostgreSQL** 16+ (Must have **PostGIS** extension enabled)
  - **Redis** 7+
  - **Typesense Server** (Running locally on port 8108)
  - **npm** or **yarn**

### 📦 Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repo-url>
    cd offerify/backend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    ```bash
    cp .env.example .env
    ```

    *Edit `.env` and ensure DB credentials are correct.*

4.  **Database Setup (PostGIS):**
    Before running the app, enable PostGIS in your Postgres database:

    ```sql
    -- Run this SQL in your database tool (pgAdmin/DBeaver)
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```

5.  **Run Migrations & Seeds:**

    ```bash
    # Create Tables
    npm run migration:run

    # Populate Bangladesh Location Data (Dhaka, Gulshan, etc.)
    npm run seed:location
    ```

6.  **Start the Server:**

    ```bash
    # Development Mode (Watch Mode)
    npm run start:dev
    ```

      - **API:** http://localhost:3000
      - **Swagger:** http://localhost:3000/api-docs

-----

## 🛠️ Development Workflow (TDD)

We strictly follow **Test-Driven Development**. Never write implementation code without a failing test.

### Test Commands

```bash
# 🔴 Run Unit Tests in Watch Mode (Primary Dev Command)
npm run test:watch

# Run specific test file
npm run test -- src/modules/offers/offers.service.spec.ts

# Run End-to-End (Integration) Tests
npm run test:e2e

# Generate Test Coverage
npm run test:cov
```

### Standard Scripts

```bash
# Build for Production
npm run build

# Lint Code
npm run lint

# Format Code
npm run format

# Run DB Migrations
npm run migration:run

# Revert Last Migration
npm run migration:revert
```

-----

## 📁 Project Structure

```bash
backend/
├── src/
│   ├── config/              # TypeORM, Redis, & Typesense Config
│   ├── modules/             # Domain Modules (Vertical Slice)
│   │   ├── location/        # CSC Logic & PostGIS Queries
│   │   │   ├── entities/    # City, State, Country
│   │   │   └── location.service.ts
│   │   ├── offers/          # Deals, Coupons, Vouchers
│   │   │   ├── entities/    # Unified 'Offer' entity
│   │   │   └── dto/         # CreateOfferDto
│   │   ├── vendors/         # Vendor Profiles & Map Pins
│   │   └── auth/            # JWT & Role Guards
│   ├── common/              # Shared DTOs, Decorators, Enums
│   ├── database/            # Seeds & Migration files
│   └── main.ts              # Entry point (Fastify)
├── test/                    # E2E Tests
├── .env.example             # Environment Template
└── package.json
```

-----

## 🔧 Configuration (.env)

Create a `.env` file in the `backend/` root:

```env
# APP
NODE_ENV=development
PORT=3000

# DATABASE (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=offerify_db

# REDIS (Cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# TYPESENSE (Search)
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=xyz_api_key

# AUTH
JWT_SECRET=super_secret_key_for_offerify
JWT_EXPIRATION=7d

# GOOGLE MAPS (Optional for Geocoding)
GOOGLE_MAPS_API_KEY=AIzaSy...
```

-----

## 🗺️ Database Schema & Seeding

### The CSC Model

The system relies on **Country \> State \> City (Zone)** hierarchy. The app **will not work** correctly without seeding the location data first.

**Seeding Command:**

```bash
npm run seed:location
```

*This script populates Bangladesh, Divisions (States), and major Areas (Cities/Zones) like Gulshan, Banani, Dhanmondi with their Center GPS Coordinates.*

### Migration Management

We use TypeORM Migrations. **Do not** use `synchronize: true` in production.

```bash
# Generate Migration (After changing Entity)
npm run migration:generate --name=AddVoucherLimit

# Run Migration
npm run migration:run
```

-----

## 🧪 Testing Strategy

### Unit Tests (`.spec.ts`)

  - Mock all Repositories and Dependencies.
  - Focus on Business Logic (e.g., "Should throw error if voucher limit reached").

### E2E Tests (`/test/*.e2e-spec.ts`)

  - Uses a real **Test Database**.
  - Tests strict **PostGIS** logic (e.g., "Does Auto-Detect return Gulshan when I am at coordinates X,Y?").
  - **Note:** E2E tests automatically clear the test database after running.

-----

## 🚨 Troubleshooting (Local Setup)

1.  **Error: `function st_dwithin does not exist`**

      * **Fix:** You forgot to enable PostGIS. Run `CREATE EXTENSION postgis;` in your SQL query tool.

2.  **Error: `Connection refused (Redis/Typesense)`**

      * **Fix:** Since we aren't using Docker, make sure you have started the Redis server and Typesense server manually on your machine.

3.  **Typesense Error:**

      * Ensure Typesense is running on port `8108` or update the `.env` file.

-----

### Production Build

```bash
# Build
npm run build

# Start Production Server
npm run start:prod
```