# SYSTEM\_DESIGN.md - Offerify Architecture & Design

## 1\. Executive Summary

Offerify is a **hyper-local deal discovery platform** designed to connect customers with vendors through a structured, location-aware ecosystem. The system aggregates offers, coupons, and vouchers, allowing users to find value in their immediate vicinity or specifically selected zones.

**Key Value Proposition:**

  * **For Users:** "Find the best deals in *Gulshan* (or my current location) instantly."
  * **For Vendors:** "Target customers specifically in my operating zone with verified offers."

-----

## 2\. Architectural Principles

### 2.1 The Hybrid Location Architecture (Global CSC)

We utilize a **standardized Relational Hierarchy** for data organization combined with **Geospatial Auto-Detection** for user experience.

  * **The Hierarchy:** `Country` \> `State` \> `City` (Functions as **Zone**).
  * **The "Zone" Concept:** The `City` entity is the core operational unit.
      * *Example:* "Gulshan", "Uttara", "Dhanmondi" are stored as `cities`.
      * *Logic:* Every Zone has a `center_point` (Lat/Long).
  * **Auto-Detect Strategy:**
      * The system does **not** rely on arbitrary radius circles for feed generation.
      * Instead, it uses user GPS to find the **Nearest Zone ID** using PostGIS (`ST_DWithin` / `ORDER BY <->`).
      * The App creates a session based on this `Zone ID` (e.g., `zone_id: 5`). All feeds are filtered by `WHERE city_id = 5`.

### 2.2 Unified Offer Strategy

To ensure a high-performance "Smart Feed" (Infinite Scroll), we use a **Single Table Inheritance** strategy for all offer types.

  * **Single Table:** `offers`
  * **Differentiation:** Managed via `type` ENUM (`discount`, `coupon`, `voucher`).
  * **Benefit:** Eliminates complex `UNION` queries and allows distinct sorting/indexing on a single timeline.

-----

## 3\. Tech Stack & Infrastructure

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | **NestJS 11** (Fastify) | API Framework, chosen for speed and modularity. |
| **Database** | **PostgreSQL 16+** | Primary datastore. |
| **Geospatial** | **PostGIS Extension** | Handles spatial calculations (Distance, Nearest Neighbor). |
| **ORM** | **TypeORM** | Database abstraction and relation management. |
| **Search** | **Typesense** | Typo-tolerant, sub-50ms search engine for products/brands. |
| **Caching** | **Redis** | Caches Zone Feeds (`feed:zone:5`) and Session data. |
| **Frontend** | **Expo (React Native)** | Cross-platform Mobile (iOS/Android) + Web. |
| **Styling** | **NativeWind** | Utility-first CSS styling for React Native. |

-----

## 4\. Database Schema Design

### 4.1 Entity Relationship Diagram (ERD)

### 4.2 Core Tables & DDL

#### **A. Location Module (The CSC Backbone)**

```sql
-- 1. Countries
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) NOT NULL UNIQUE, -- 'BD'
    currency_symbol VARCHAR(10) DEFAULT '৳',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. States (Divisions)
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Dhaka Division'
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE
);

-- 3. Cities (ZONES - The most critical table)
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Gulshan'
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    
    -- The specific point used for Auto-Detect logic
    center_point GEOGRAPHY(POINT, 4326), 
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for Geospatial Nearest Neighbor Search
CREATE INDEX idx_cities_center ON cities USING GIST (center_point);
```

#### **B. Offer Module (Unified Table)**

```sql
-- ENUMS
CREATE TYPE offer_type AS ENUM ('discount', 'coupon', 'voucher');
CREATE TYPE offer_status AS ENUM ('active', 'draft', 'expired', 'banned');

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(user_id),
    
    -- Denormalized Zone ID for high-speed Feed Queries
    city_id INT NOT NULL REFERENCES cities(id),
    
    -- Shared Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]',
    
    type offer_type NOT NULL, 
    status offer_status DEFAULT 'active',
    
    -- Type: DISCOUNT Specific
    original_price DECIMAL(10, 2),
    discounted_price DECIMAL(10, 2),
    
    -- Type: COUPON Specific (Code)
    coupon_code VARCHAR(50),
    
    -- Type: VOUCHER Specific (Claim)
    voucher_limit INT,
    voucher_claimed_count INT DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- COMPOSITE INDEX: Critical for Feed Performance
-- "Show me Active offers in Zone X, sorted by Newest"
CREATE INDEX idx_feed_query ON offers (city_id, status, valid_until, created_at DESC);
```

#### **C. Engagement Module**

```sql
CREATE TABLE offer_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    is_used_in_store BOOLEAN DEFAULT FALSE, -- For QR Verification
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(offer_id, user_id) -- Prevent duplicate claims
);
```

-----

## 5\. Core Logic & Algorithms

### 5.1 Auto-Detect Location (The "Near Me" Logic)

When a user opens the app and grants GPS permission:

1.  **Input:** User GPS `(lat, long)`.
2.  **Query:** Find the closest `city` (Zone) from the database.
    ```sql
    SELECT id, name, center_point 
    FROM cities
    ORDER BY center_point <-> ST_SetSRID(ST_Point($userLong, $userLat), 4326)
    LIMIT 1;
    ```
3.  **Action:**
      * Set App Context to `zone_id: <result.id>`.
      * Fetch Offers: `SELECT * FROM offers WHERE city_id = <result.id>`.

### 5.2 Search Logic (Typesense Integration)

We do **not** perform search queries (`LIKE %...%`) on PostgreSQL.

1.  **Syncing:**
      * When an Offer is Created/Updated/Deleted -\> Emit Event.
      * Worker pushes simplified JSON object to Typesense Collection `offers`.
2.  **Querying:**
      * Frontend sends query "Burger" + `filter_by: city_id:=5`.
      * Typesense returns top Document IDs.
      * Backend fetches full details for those IDs from DB (or Cache) and returns to user.

### 5.3 Voucher Concurrency (The "Race Condition" Handler)

For "First 50 Users" vouchers, we handle high concurrency using atomic DB updates.

```sql
-- Atomic Update: Only succeeds if limit is not reached
UPDATE offers 
SET voucher_claimed_count = voucher_claimed_count + 1 
WHERE id = $offerId 
  AND voucher_claimed_count < voucher_limit;
```

  * If `affected_rows == 0`, throw "Voucher Sold Out" error.

-----

## 6\. Scalability & Partitioning

### 6.1 Partitioning Strategy

Since `offers` accumulate rapidly and expire:

  * **Strategy:** Declarative Partitioning by `valid_until` (Time-based).
  * **Structure:**
      * `offers_active`: Partition for currently valid offers.
      * `offers_history_2024_q1`: Partition for expired offers.
  * **Benefit:** Feed queries only scan the active partition, keeping the index size small and responses fast.

### 6.2 Caching Strategy (Redis)

  * **Feed Caching:**
      * Key: `feed:zone:{zoneId}:page:{pageNo}`
      * Value: Pre-rendered JSON list of offers.
      * TTL: 5 Minutes.
  * **Invalidation:**
      * Triggered when a Vendor in that Zone posts a new offer.

-----

## 7\. Security Guidelines

  * **Geo-Fencing:** APIs creating offers must validate that the `operating_city_id` matches the vendor's authorized zone.
  * **Role-Based Access Control (RBAC):**
      * `@Roles('vendor')` can only update their own offers.
      * `@Roles('admin')` can ban any offer or vendor.
  * **Input Validation:** Strict `class-validator` DTOs for all API inputs to prevent SQL injection and malformed data.

-----

## 8\. Future Roadmap (V2 Preparation)

  * **ML Integration:** The schema supports `views_count`, `clicks_count`, and `saves_count`. This data will be the training set for the future Recommendation Engine.
  * **Dynamic Polygons:** In V2, we may replace `center_point` with strict `POLYGON` boundaries for cities if precise street-level borders are required.