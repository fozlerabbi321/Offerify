## 📋 Project Summary

### Project Title
**Offerify - Smart Offer & Deal Discovery Platform**

### Overview

Offerify is a **smart platform** where users can easily discover all ongoing product offers and discounts from various **brands, stores, and local vendors** — both online and nearby. It centralizes all deals into one mobile and web application, showing offers through an **infinite-scroll Smart Feed** and a **Map View** for location-based exploration.

Vendors (big or small) can post verified offers, while customers can browse, search, and save deals they like. The system includes:
- 📱 **Customer Panel** - Browse and discover offers
- 🏪 **Vendor Panel** - Same application, dual mode for posting offers
- 🖥️ **Admin Web Panel** - Manage users, vendors, and content
- ⚙️ **Centralized Backend** - Data management and APIs

> **Core Vision:** Bring all offers to one place so that small vendors/shops can reach customers easily, and customers can see everything from a single application.

The platform was built **99.99% using AI tools** — from initial architecture design to final deployment.

### What Offerify Does

| For Customers | For Vendors |
|---------------|-------------|
| � Discover offers from brands, stores & local vendors | 🏪 Create and manage multiple shop locations |
| 🗺️ Explore deals via Smart Feed or Map View | 📝 Post verified offers (discounts, coupons, vouchers) |
| 🎫 Claim vouchers, use coupons, find discounts | 📊 Track offer performance and redemptions |
| 💾 Save favorite offers for later | 🔍 Target customers in specific operating zones |
| ⭐ Write and read reviews | 📈 View dashboard analytics |

### Technical Highlights

- **Full-Stack Application**: NestJS 11 backend + Expo SDK 53 frontend
- **Cross-Platform**: Web, iOS, and Android from a single React Native codebase (Web fully functional, iOS and Android working)
- **Smart Discovery**: Infinite-scroll feed + Map View with PostGIS geospatial queries
- **Unified Offer System**: Discounts, Coupons, and Vouchers in one table with Single Table Inheritance
- **Role-Based Access**: Customer, Vendor, and Admin user types
- **Dual-Mode App**: Same app works for customers and vendors
- **TDD Workflow**: Backend developed using Test-Driven Development with Unit & E2E tests

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11 + Fastify + TypeORM |
| **Database** | PostgreSQL + PostGIS |
| **Frontend** | Expo SDK 53 + React Native + React Native Web |
| **Styling** | NativeWind (Tailwind for React Native) |
| **State Management** | Zustand + TanStack Query |
| **Testing** | Jest + React Native Testing Library |
| **Deployment** | Railway (Backend) + Vercel (Frontend) |

---

## 🛠️ AI Tools Used

### Primary AI Agents for Development

| Tool | Model(s) Used | Purpose |
|------|---------------|---------|
| **Claude Agent (Antigravity)** | Claude Sonnet 4.5, Claude Opus 4.5 | Primary development agent for all coding, debugging, and feature implementation |
| **Gemini 3 (Antigravity)** | gemini-3 | Backend agent model for complex architectural decisions |
| **Gemini Chat** | gemini.google.com/app | Decision-making, brainstorming, and architectural discussions |

---

## 🔧 How Each AI Tool Was Used

### 1. Gemini Chat (Architecture, Decision Making & Planning)

**Purpose:** Created the foundational project architecture and strategic planning

**Key Contributions:**
- Designed the complete database schema using the **Global CSC (Country > State > City)** model
- Created `GEMINI.md`, `database-schema.md`, `SYSTEM_DESIGN.md` and other docs for initial project architecture
- Established the **TDD (Test-Driven Development)** workflow mandates
- Defined the unified offer strategy (Single Table Inheritance for offers, coupons, vouchers)
- Discussed trade-offs between different database designs
- Helped decide on the Multi-Shop architecture for vendors
- Assisted in planning the deployment strategy (Railway + Vercel)
- Reviewed and refined API endpoint structures

---

### 2. Antigravity Agent (Full Development)

**Purpose:** 100% of the actual code implementation

The Antigravity Agent was used for **every aspect** of development:

#### A. Backend Development (TDD Workflow)

The backend was developed following strict **Test-Driven Development (TDD)** methodology:

**🔴 RED → 🟢 GREEN → 🔵 REFACTOR**

1. Write failing test first
2. Write minimum code to pass
3. Refactor while keeping tests green

| Feature | What AI Did |
|---------|-------------|
| **Authentication System** | JWT-based auth with refresh tokens, role guards |
| **User Management** | CRUD for users with role differentiation |
| **Vendor System** | Onboarding, profile management, multi-shop support |
| **Offers Module** | Create, update, delete offers with type differentiation |
| **Location Detection** | PostGIS integration for "Near Me" queries |
| **Reviews & Ratings** | Full review system with average calculations |
| **Admin Panel APIs** | User/vendor management, analytics endpoints |
| **Database Migrations** | All TypeORM migrations |
| **Seeding** | Master seeder with realistic test data |
| **Unit Tests** | Jest tests for all services (.spec.ts files) |
| **E2E Tests** | Integration tests for API endpoints |

#### B. Frontend Development

| Feature | What AI Did |
|---------|-------------|
| **Navigation System** | Expo Router with role-based routing |
| **Home Feed** | Infinite scroll with location-based offers |
| **Map View** | React Native Maps with offer markers |
| **Offer Details** | Full detail view with reviews section |
| **Vendor Dashboard** | Stats, recent offers, QR scanner |
| **Admin Panel** | User/vendor management screens |
| **Responsive Design** | Mobile + Desktop layouts |
| **Authentication Gates** | Login required modals and screens |

#### C. DevOps & Deployment

| Task | What AI Did |
|------|-------------|
| **Docker Configuration** | Dockerfile and docker-compose files |
| **Railway Deployment** | Backend deployment with PostGIS setup |
| **Database Migrations** | Production migration scripts |
| **Environment Setup** | Development and production env configs |

---

## 📝 Prompts Used During Development

Below are the actual prompts given to AI agents during the development of Offerify. These represent the conversation-based workflow used to build the entire application.

---

### 🏗️ Phase 1: Architecture & Database Design

**Prompt 1 - Initial Architecture Planning (Gemini Chat):**
```
Create a hyper-local deal discovery platform architecture for Bangladesh. 
Requirements:
- Country > State > City hierarchy (CSC model)
- PostGIS for location detection and "Near Me" functionality
- Vendors can have multiple shop locations
- Unified offer system supporting: Discounts (percentage off), Coupons (codes), Vouchers (limited claims)
- Use Single Table Inheritance for offers to avoid complex UNION queries
- Design for high-performance infinite scroll feeds

Output a complete SYSTEM_DESIGN.md and database schema.
```

**Prompt 2 - Developer Standards Document (Gemini Chat):**
```
Create a GEMINI.md file that will act as a "system prompt" for AI agents working on this project. Include:
- Tech stack details (NestJS 11, Fastify, TypeORM, Expo SDK 53, NativeWind)
- TDD mandate (Red-Green-Refactor workflow)
- Non-negotiable rules (Location hierarchy, database integrity, API standards)
- Directory structure for backend and frontend
- Common pitfalls to avoid
```

---

### 🔐 Phase 2: Authentication & User System

**Prompt 3 - Initial Backend Setup (AI Agent):**
```
Initialize the NestJS backend project with:
- Project structure following GEMINI.md guidelines
- Set up TypeORM with PostgreSQL + PostGIS
- Create all entities based on database-schema.md and SYSTEM_DESIGN.md
- Configure Fastify adapter
- Set up environment configuration
- Create location module (countries, states, cities)
- Follow TDD workflow mandates from GEMINI.md
```

**Prompt 4 - Auth Module Implementation:**
```
Implement complete JWT authentication for NestJS:
- Access token (short-lived)
- Role-based guards: @Roles('customer'), @Roles('vendor'), @Roles('admin')
- Login and Register endpoints with proper DTOs
- Password hashing with bcrypt
- Return user data with tokens on successful auth
```

**Prompt 5 - Vendor Onboarding Flow:**
```
Create a vendor onboarding system:
1. Customer can apply to become a vendor by providing: business_name, business_type, category_id, city_id
2. When vendor profile is created, automatically create a "default" shop in their selected city
3. The shop should have is_default: true flag
4. Update user role from 'customer' to 'vendor'
5. Return the new vendor profile with shop data
```

---

### 🎫 Phase 3: Offers & Location Features

**Prompt 6 - Offers CRUD with Multi-Type Support:**
```
Implement the Offers module with full CRUD:
- CreateOfferDto: title, description, type (enum: discount/coupon/voucher), categoryId, optional shopId
- For type='discount': require discountPercentage
- For type='coupon': require couponCode
- For type='voucher': require voucherValue and voucherLimit
- If shopId not provided, use vendor's default shop
- Inherit cityId from the shop's city
- Only offer owner (vendor) can update/delete their offers
```

**Prompt 7 - Location Auto-Detection API:**
```
Create location detection endpoint using PostGIS:
1. Accept user GPS coordinates (latitude, longitude)
2. Find nearest city using ST_DWithin or ORDER BY <-> operator
3. Return the matched city with id, name, and distance
4. This city_id will be used to filter all offer feeds
Example query: ORDER BY center_point <-> ST_SetSRID(ST_Point($long, $lat), 4326) LIMIT 1
```

**Prompt 8 - Category Display Fix:**
```
Debug: Frontend only shows 1 category but backend seeder creates 8.
1. Check the /api/categories endpoint response
2. Verify the frontend is correctly unwrapping { data: categories } response
3. Ensure the category list component renders all items, not just the first
```

---

### 📱 Phase 4: Frontend Implementation

**Prompt 8 - Responsive Home Screen:**
```
Create the home screen for Offerify:
- Header with location picker and search
- Horizontal scrollable category chips
- Offer cards in responsive grid:
  - Mobile: 1 column
  - Tablet: 2 columns  
  - Desktop: 3-4 columns
- Each card shows: image, title, discount badge, shop name, distance
- Implement infinite scroll with TanStack Query
- Pull to refresh functionality
```

**Prompt 9 - Map Page with Offer Markers:**
```
Implement the Map screen:
1. Use react-native-maps with the currently selected city as center
2. Show markers for each offer in the city
3. Handle overlapping markers - offset coordinates slightly so all are visible
4. When city changes in location store, refetch offers for new city
5. Clicking marker shows offer preview, tapping preview opens full details
```

**Prompt 10 - Vendor Dashboard Implementation:**
```
Create the Vendor Dashboard (app/(tabs)/vendor/index.tsx):
- Stats cards row: Total Offers, Active Offers, Total Reviews, Average Rating
- "Recent Offers" section: horizontal scrollable list of last 5 offers
- "Latest Reviews" section: vertical list of last 5 reviews with star ratings
- Stats should fetch from GET /api/vendors/stats
- Add skeleton loaders while data is loading
- Remove "Switch to Customer" button from this screen
```

**Prompt 11 - Authentication Gates:**
```
Implement authentication gates for the app:
1. Page-level: If not logged in, show "Login Required" view on: Saved, Wallet, Vendor, Account pages
2. Action-level: Create a universal "Login Required" modal that appears when unauthenticated user tries to:
   - Add offer to favorites
   - Claim a voucher
   - Write a review
   - Click notification icon
Use the existing design from the Saved page as template for consistency.
```

---

### 🛠️ Phase 5: Bugs, Refinements & Admin

**Prompt 12 - Backend Test Fixes:**
```
Fix failing backend unit tests:
1. OffersService tests failing - ShopRepository is not mocked
2. VendorsService tests failing - save() is now called 3 times (user + vendor + shop) instead of 2
Add the missing mocks and update assertion counts.
```

**Prompt 13 - Admin Panel Frontend (Iterative AI Workflow):**
```
Create Admin Panel frontend with:
- Protected admin routes (/admin/*)
- Dashboard with stats overview
- Users management page (list, view, delete users)
- Vendors management page (list, view, delete vendors)
- Use TanStack Query for data fetching
- Make it responsive for web

(After initial prompt, continued iterative work with AI agent to refine 
UI/UX, fix bugs, add features like modals, loading states, error handling)
```

**Prompt 14 - Profile Update Fix:**
```
Fix profile update functionality:
1. Avatar URL sent as entire response object instead of just URL string
2. 400 Bad Request due to phone number validation
Solution:
- Extract only the URL from cloudinary response
- Update phone number regex pattern to accept local format
- Ensure successful save reflects immediately in UI
```

---

### 📊 Phase 6: Polish & Refinements

**Prompt 15 - Vendor Stats API Enhancement:**
```
Update GET /api/vendors/stats to include:
- totalOffers: count of all vendor's offers
- activeOffers: count where status='active' and valid_until > now
- inactiveOffers: count of expired or draft offers
- ratingAvg: average rating from reviews
- reviewCount: total number of reviews
Frontend should correctly unwrap the { data: stats } response format.
```

**Prompt 16 - Offer Details with Reviews:**
```
Implement the Offer Details page reviews section:
1. Display existing reviews with: user avatar, name, rating stars, review text, date
2. "Write Review" button for authenticated users
3. Review form: star rating selector (1-5), text input, submit button
4. After submit, refresh reviews list
5. Make sure it works on both mobile and desktop views
```

---

## 📊 Development Statistics

| Metric | Value |
|--------|-------|
| **Total Conversations with AI** | 20+ major sessions |
| **Backend Files Generated** | 100+ files |
| **Frontend Files Generated** | 80+ files |
| **Database Migrations** | Multiple TypeORM migrations |
| **Backend Testing** | Unit Tests + E2E Tests (Jest) |
| **Development Methodology** | TDD (Test-Driven Development) |
| **Human Code Written** | **~0.01%** |
| **AI Code Written** | **~99.99%** |

---

## 🎯 Key Features Implemented via AI

### Backend Features
- [x] JWT Authentication with Refresh Tokens
- [x] Role-Based Access Control (RBAC)
- [x] Multi-Shop Vendor System
- [x] Unified Offers (Discount/Coupon/Voucher)
- [x] PostGIS Location Detection
- [x] Reviews & Ratings System
- [x] Image Upload with Cloudinary
- [x] Admin Management APIs
- [x] Database Seeding
- [x] **Unit Tests** (Service-level testing with Jest)
- [x] **E2E Tests** (API integration testing)

### Frontend Features
- [x] Cross-Platform (Web + iOS + Android)
- [x] Responsive Design (Mobile + Desktop)
- [x] Location-Based Home Feed
- [x] Interactive Map View
- [x] Vendor Dashboard
- [x] QR Code Scanner
- [x] Admin Panel
- [x] Authentication Flow
- [x] Search

---

## 🏆 What Makes This Project Special

1. **99.99% AI-Generated**: Virtually all code was generated by AI agents
2. **TDD Methodology**: Backend developed with Test-Driven Development (Unit + E2E tests)
3. **Production-Ready**: Deployed on Railway (backend) and Vercel (frontend)
4. **Full-Stack Complexity**: Backend API + Mobile App + Web App
5. **Real-World Use Case**: Solves actual business problem of offer discovery
6. **Advanced Tech**: PostGIS, TypeORM, React Native Web, Role-Based Auth, Jest Testing

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Website** | *https://offerify.vercel.app* |
| **Admin Panel** | *https://offerify.vercel.app/admin*|
| **Custom Test Credentials** | *username: user@offerify.com password: 123456* |
| **Vendor Test Credentials** | *username: vendor@offerify.com password: 123456* |
| **Admin Panel Credentials** | *username: admin@offerify.com password: 123456* |
| **Backend API Documentation** | *https://offerify-production.up.railway.app/offerify-api-docs* |

---
