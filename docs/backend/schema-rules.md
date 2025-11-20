# schema-rules.md - Database & Schema Guidelines

This document outlines the mandatory rules for modifying the database schema, defining entities, and writing queries for **Offerify**. It ensures consistency across the **PostgreSQL (PostGIS)** and **TypeORM** layer.

**Reference:**

  * [System Architecture](https://www.google.com/search?q=../architecture/SYSTEM_DESIGN.md) (The "Why" behind these rules)

-----

## 1\. Naming Conventions

We follow strict naming conventions to maintain harmony between the Database (SQL) and the Application (TypeScript).

| Object | Convention | Example (SQL) | Example (TypeORM) |
| :--- | :--- | :--- | :--- |
| **Table Names** | Plural, snake\_case | `vendor_profiles`, `offer_redemptions` | `@Entity('vendor_profiles')` |
| **Columns** | snake\_case | `is_active`, `valid_until` | `@Column({ name: 'is_active' }) isActive` |
| **Primary Keys** | `id` | `id` | `id` |
| **Foreign Keys** | `noun_id` | `city_id`, `vendor_id` | `@JoinColumn({ name: 'city_id' })` |
| **Indexes** | `idx_table_column` | `idx_cities_center` | `@Index('idx_cities_center')` |

**Rule:** ALWAYS explicitly define the `name` property in TypeORM decorators to prevent auto-generated camelCase columns in Postgres.

```typescript
// ✅ GOOD
@Column({ name: 'created_at' })
createdAt: Date;

// ❌ BAD (Creates "createdAt" column in DB)
@Column()
createdAt: Date;
```

-----

## 2\. Primary Key Strategy

We use a Hybrid ID strategy to balance performance and security.

### A. Use **UUID** (v4) for Logic Data

For data that grows infinitely or poses a security risk if enumerated.

  * **Entities:** `User`, `VendorProfile`, `Offer`, `Coupon`, `Review`.
  * **Type:** `uuid`
  * **Default:** `uuid_generate_v4()`

### B. Use **Integer (Serial)** for Location Data

For static, hierarchical reference data that rarely changes and benefits from smaller index sizes.

  * **Entities:** `Country`, `State`, `City` (Zone).
  * **Type:** `int` (Serial)

-----

## 3\. Location & Spatial Rules (The CSC Model)

The "Auto-Detect" feature relies on specific data types. **Do not deviate.**

### A. The "City" is the "Zone"

  * In the code, we may refer to "Zones", but in the Database, this is strictly the **`cities`** table.
  * **Constraint:** Every `City` MUST belong to a `State`.

### B. No Float Lat/Longs

**NEVER** store coordinates as separate `lat` (float) and `long` (float) columns.

  * **Correct:** Use PostGIS `GEOGRAPHY(POINT, 4326)`.
  * **Reason:** This enables `ST_DWithin` (meters calculation) instead of complex math formulas.

<!-- end list -->

```typescript
// ✅ CORRECT TypeORM Definition
@Column({
  type: 'geography',
  spatialFeatureType: 'POINT',
  srid: 4326, // WGS 84 Standard
})
centerPoint: Point;
```

### C. Spatial Indexing

Any table with a `geography` column **MUST** have a **GIST Index**.

  * `cities` table -\> `idx_cities_center`
  * `vendor_profiles` table -\> `idx_vendor_location`

-----

## 4\. The Unified Offer Table Rules

We use **Single Table Inheritance** for Offers, Coupons, and Vouchers.

### A. The `type` Enum

Every row must have a type:

1.  `discount`: Standard price drop.
2.  `coupon`: Requires a code to redeem.
3.  `voucher`: Requires a claim/purchase + QR scan.

### B. Handling Nullables

Since all types share one table, columns specific to one type must be **Nullable**.

  * **Rule:** The API Layer (DTOs) must enforce presence based on type, not the Database.
      * *Example:* If `type === 'coupon'`, `coupon_code` cannot be null (Enforce in NestJS DTO, not DB constraint).

### C. Voucher Concurrency

For limited-quantity vouchers (e.g., "First 50 people"), rely on **Atomic Updates**.

  * **NEVER** read -\> check -\> write.
  * **ALWAYS** decrement/increment in a single `UPDATE` query.

-----

## 5\. Indexing Strategy

Indexes are not optional; they are part of the design.

### A. Foreign Keys

**ALWAYS** index foreign key columns if they are used in filtering.

  * `vendor_profiles.operating_city_id`
  * `offers.vendor_id`

### B. The "Smart Feed" Composite Index

The main home feed query is: "Get active offers in Zone X, sorted by newest."
The `offers` table **MUST** have this exact composite index:

```sql
CREATE INDEX idx_feed_query ON offers (city_id, status, valid_until, created_at DESC);
```

**Rule:** If you modify the default sort order of the feed, you MUST update this index.

-----

## 6\. TypeORM & Relation Best Practices

### A. No Eager Loading

**NEVER** use `eager: true` on relations. It causes massive performance chains.

  * **Solution:** Explicitly use `relations: ['vendor', 'city']` in your Service calls.

### B. Cascade Deletes

  * **Parent-Child:** Use `onDelete: 'CASCADE'`.
      * If a `User` is deleted, their `VendorProfile` and `Offers` should vanish.
  * **Reference Data:** Use `onDelete: 'RESTRICT'` (or default).
      * You cannot delete a `City` if active `Offers` exist in it.

-----

## 7\. Migration Guidelines

  * **Production:** Never use `synchronize: true`.
  * **Development:** Use Migrations for all structural changes.
  * **Step-by-Step:**
    1.  Modify Entity file.
    2.  Run `npm run migration:generate --name=ChangeDescription`.
    3.  Check the generated SQL file (ensure no data loss).
    4.  Run `npm run migration:run`.

-----

## 8\. JSONB Usage

Use `JSONB` for flexible, non-searchable metadata.

  * **Images:** Store as `['url1', 'url2']` (JSON Array).
  * **Vendor Meta:** Store `opening_hours`, `social_links` in `meta_data` column.
  * **Rule:** Do not try to query *inside* the JSONB frequently. If you need to filter by it often, make it a real column.