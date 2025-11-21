
# 🏗️ Offerify Project Architecture & Directory Map

This document outlines the high-level directory structure and technology stack for the Offerify ecosystem. The codebase is organized as a monorepo containing the API Server (Backend) and a **Unified Cross-Platform Application** (Frontend) that serves Customers, Vendors, and Admins.

## 📂 Directory Tree

```bash
offerify/
├── backend/                  # NestJS API (Geo-aware Deal Engine)
│   ├── src/                  # Source code
│   │   ├── features/         # Feature modules (location, offers, vendors, etc.)
│   │   ├── common/           # Shared DTOs, decorators, and guards
│   │   ├── config/           # Environment (Dotenv) & Database config
│   │   ├── domain/           # TypeORM Entities & Interfaces (CSC Model)
│   │   └── infra/            # Infrastructure (PostGIS, Typesense, Redis)
│   ├── tests/                # Unit (TDD) and E2E tests
│   └── scripts/              # Seeding and migration scripts
├── frontend/                 # Unified Expo Super App (Customer + Vendor + Admin)
│   ├── app/                  # Expo Router (Role-Based Navigation)
│   │   ├── (auth)/           # Login, Register, Forgot Password (Shared)
│   │   ├── (customer)/       # CUSTOMER PANEL (Tabs: Feed, Map, Wallet)
│   │   ├── (vendor)/         # VENDOR PANEL (Dashboard, Post Offer, Scan QR)
│   │   ├── (admin)/          # ADMIN PANEL (Web Optimized: Users, Approvals)
│   │   └── _layout.tsx       # Root Layout (Auth Check & Role Redirection)
│   ├── src/
│   │   ├── components/       # UI Atoms (NativeWind)
│   │   │   ├── shared/       # Common Buttons, Inputs
│   │   │   ├── cards/        # Offer Cards, Vendor Stats Cards
│   │   │   └── admin/        # Data Tables, Charts (Admin specific)
│   │   ├── features/         # Feature-based Logic
│   │   │   ├── feed/         # Customer Feed Logic
│   │   │   ├── management/   # Vendor Offer Management
│   │   │   └── moderation/   # Admin Approval Logic
│       ├── contexts/         # Global state (Auth, Location Context)
│   │   ├── hooks/            # React Query Hooks (useAuth, useOffers)
│   │   ├── store/            # Zustand Global Store (Session/Theme)
│   │   ├── services/         # API Client, Typesense, Maps Config
│   │   └── types/            # TypeScript Interfaces
│   ├── assets/               # Images, Fonts, Lottie Files
│   ├── constants/            # Colors, Layout Metrics
│   └── tailwind.config.js    # NativeWind Configuration
│
├── docs/                     # Project Documentation
│   ├── architecture/         # System Design & CSC Logic
│   ├── backend/              # Schema Rules & API Docs
│   └── development/          # TDD Workflows & Guides
│
└── scripts/                  # CI/CD & Utility Scripts
```

-----

## 🛠️ Technology Stack

### 🧠 Backend (The Core Engine)

  * **Framework:** NestJS 11 (Fastify Adapter).
  * **Database:** PostgreSQL 16+ with **PostGIS**.
  * **Auth:** JWT (Role-based Guards: `UseGuards(RolesGuard)`).
  * **Search:** Typesense.
  * **Testing:** Jest (TDD).

### 📱 Frontend (The Unified App)

  * **Framework:** Expo SDK 53 (React Native) + React 19.
  * **Target Platforms:**
      * **Customer/Vendor:** iOS & Android (Mobile First).
      * **Admin:** Web (Desktop Optimized).
  * **Routing:** Expo Router v3 (File-based routing with Groups).
  * **Styling:** **NativeWind** (Tailwind CSS).
  * **State Management:** TanStack Query (Server) + Zustand (Client).
  * **Map:** Google Maps (react-native-maps).

## 🧱 Monorepo Organization strategy

The project is structured to support distinct lifecycles for the API and the App while sharing architectural concepts.

### 1\. `/backend` (Service Layer) Focuses on data integrity, location accuracy, and business logic.
  * **Key Responsibility:** Maintaining the "One Offer Table" integrity and calculating the "Nearest Zone" via PostGIS.

### 2\. `/frontend` (Consumption Layer) Focuses on user experience, offline capabilities (Voucher Wallet), and location context.
* **Key Responsibility:** Efficiently rendering the Infinite Feed and managing the user's geographic context (Auto-detect vs Manual Selection).

### 3\. `/docs` (Knowledge Base) The single source of truth. Code should not be written unless the architecture is defined here first.
 * **Critical File:** `docs/architecture/SYSTEM_DESIGN.md` contains the logic that binds the Backend and Frontend together.
