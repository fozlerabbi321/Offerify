# GEMINI.md - Offerify Developer Standards

This document defines the operational context, architectural constraints, and strict **Test-Driven Development (TDD)** workflow for AI assistants contributing to **Offerify**.

## 🌐 System DNA & Tech Stack

Offerify is a **hyper-local** deal discovery platform built on a **Global CSC (Country \> State \> City)** model.

| Layer | Technology | Key Constraints |
| :--- | :--- | :--- |
| **Core Backend** | **NestJS 11** + Fastify | Modular Monolith. **Jest** for TDD. |
| **Database** | **PostgreSQL** + **PostGIS** | Use `geography` types. No float lat/long. |
| **ORM** | **TypeORM** | Strict Entity relations. |
| **Frontend** | **Expo (React Native)** | SDK 53. **NativeWind** for styling. |
| **Testing** | **Jest** & **RNTL** | React Native Testing Library for Frontend. |
| **Search** | **Typesense** | No SQL `LIKE` queries for search. |

-----

## ⚡ The "Non-Negotiables" (Critical Directives)

### 1\. The TDD Mandate (Red-Green-Refactor) 🔴🟢🔵

**You must follow TDD for every task.**

  * **RED:** Write a failing test case first (based on requirements).
  * **GREEN:** Write the *minimum* amount of code to pass the test.
  * **REFACTOR:** Optimize the code structure without breaking the test.
  * *AI Instruction:* **ALWAYS** generate the **Test Code** block *before* the Implementation Code block.

### 2\. The Location Hierarchy is Law 🗺️

The system relies on `Country > State > City (Zone)`.

  * **Constraint:** All Offers/Vendors **MUST** link to a `city_id`.
  * **Logic:** Auto-detection uses PostGIS `ST_DWithin`. **Never** mock this logic poorly; test it with real geometry data in integration tests.

### 3\. Database Integrity & Unified Tables 💾

  * **Single Table Inheritance:** Offers, Coupons, and Vouchers live in the `offers` table.
  * **Differentiation:** Use the `type` Enum (`discount`, `coupon`, `voucher`).
  * **UUIDs:** Use `uuid` for logic entities, `int` for static Location data.

-----

## 📚 Knowledge Base Index

Context must be retrieved from these definitions before writing tests:

  * **ARCHITECTURE:** `docs/architecture/SYSTEM_DESIGN.md` (CSC Logic, Auto-Detect).
  * **DB RULES:** `docs/backend/schema-rules.md` (Naming, Indexing).

-----

## 🛠️ TDD Development Lifecycle

Follow this strict loop for every task:

### Phase 1: Design & Mocking

1.  **Analyze:** Understand the requirement (e.g., "Create Voucher").
2.  **Schema Check:** Does it need a DB migration? (Consult `schema-rules.md`).
3.  **Interface Definition:** Define the Input DTO and Expected Output Interface.

### Phase 2: The TDD Loop (Backend)

1.  **Create Spec:** `nest g service modules/offers --no-spec` (Manually create spec file).
2.  **Write Test (RED):**
    ```typescript
    it('should throw error if voucher limit is exceeded', async () => {
      // Setup mock repository behavior
      // Call service method
      // Expect error
    });
    ```
3.  **Run Test:** `npm run test:watch` (Confirm it fails).
4.  **Implement (GREEN):** Write the service logic to handle the check.
5.  **Refactor (BLUE):** Clean up logic, optimize queries.

### Phase 3: The TDD Loop (Frontend)

1.  **Write Test (RED):** Create `__tests__/OfferCard.test.tsx`. Assert that "Price" is displayed and "Claim Button" exists.
2.  **Run Test:** Confirm failure (Component doesn't exist/empty).
3.  **Implement (GREEN):** Build UI with **NativeWind**.
4.  **Verify:** Ensure NativeWind classes render correctly.

-----

## 🚀 Essential Command Palette

### Backend TDD

```bash
# Run tests in watch mode (Live Feedback) - MOST USED
npm run test:watch

# Run specific test file
npm run test -- src/modules/offers/offers.service.spec.ts

# Run Integration Tests (for PostGIS logic)
npm run test:e2e
```

### Frontend TDD

```bash
# Run Unit Tests
npm run test

# Run Type Validation
npm run type-check
```

-----

## ⚠️ Common Pitfalls to Avoid

1.  **Fake TDD:** Writing code first and tests later is **Forbidden**. The test drives the design.
2.  **Testing Implementation Details:** Test the *behavior* (output), not private methods.
3.  **Ignoring the Zone:** Tests must include `city_id` in mocks to respect the Architecture.
4.  **Voucher Race Conditions:** Integration tests for Vouchers must simulate concurrent requests to verify `atomic updates`.

-----

This file is tailored specifically for Offerify's architecture. If a user request conflicts with SYSTEM_DESIGN.md, prioritize the design document.