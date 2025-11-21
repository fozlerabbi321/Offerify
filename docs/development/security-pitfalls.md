# Security Best Practices & Common Pitfalls

## Security Best Practices

1.  **Vendor Zone Authority**: Ensure Vendors can only post offers in their assigned `operating_city_id`. Use strict ownership checks in `Guards`.
2.  **Voucher Concurrency**: Always use **Atomic Updates** (SQL `UPDATE ... SET count = count + 1`) for limited-quantity vouchers to prevent race conditions.
3.  **Geo-Fencing**: Validate that User GPS coordinates sent to the "Auto-Detect" API are within reasonable bounds (e.g., within Bangladesh lat/long ranges).
4.  **Rate Limiting**: Apply strict limits to `POST /offers` and `POST /redeem` endpoints to prevent spam and brute-force claiming.
5.  **Input Sanitization**: Use `class-validator` DTOs for all inputs. PostGIS inputs must be strictly typed to prevent Spatial SQL Injection.
6.  **Role-Based Access (RBAC)**: Never allow a `CUSTOMER` role to access `VENDOR` endpoints. Verify JWT payload `role` on every protected route.
7.  **Search Security**: Ensure **Typesense** API keys used in the frontend are "Search-Only" keys, not Admin keys.
8.  **Coupon Enumeration**: Prevent brute-force guessing of Coupon Codes by adding rate limits and complexity requirements to codes.

## Common Pitfalls (⚠️ AVOID THESE\!)

1.  **Don't store Lat/Long as Floats** - MUST use PostGIS `geography(Point, 4326)`.
2.  **Don't skip TDD** - "Fake TDD" (writing tests after code) is strictly forbidden.
3.  **Don't separate Coupon Tables** - Use the Unified `offers` table with the `type` Enum.
4.  **Don't use SQL `LIKE` for Search** - It kills performance. Push data to **Typesense** instead.
5.  **Don't use Inline Styles** - Use **NativeWind** (`className`) exclusively.
6.  **Don't read-then-write Vouchers** - This causes race conditions. Use single-query updates.
7.  **Don't Hardcode Zone IDs** - Always use the Seeder or lookups.
8.  **Don't ignore GIST Indexes** - Spatial queries without indexes will time out.
9.  **Don't use eager loading** - Avoid `eager: true` in TypeORM; it fetches too much data.
10. **Don't store API data in `useState`** - Use **TanStack Query** for caching and server-state management.

## Debugging Guidelines

### Backend Issue Debugging Protocol (TDD First)

1.  **Check the Failing Test**: Before debugging the server, look at the TDD console (`npm run test:watch`). The failure message is usually the best clue.
2.  **Ask for cURL/Payload**: When debugging API issues, isolate the request:
    ```bash
    # Example: Ask for the exact GeoJSON payload
    curl -X POST http://localhost:3000/offers \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{"title": "50% Off", "type": "voucher", "cityId": 5}'
    ```
3.  **Check PostGIS Logs**: If "Near Me" isn't working, enable TypeORM logging to see the raw SQL:
    ```typescript
    // In database.config.ts
    logging: ['query', 'error']
    ```
    *Look for `ST_DWithin` or `<->` operators in the logs.*

### Frontend Issue Debugging Protocol

1.  **Verify Types**: Run the type checker to catch mismatching DTOs.
    ```bash
    cd frontend && npm run type-check
    ```
2.  **Inspect Network via React Query**: Use the `onSuccess`/`onError` callbacks in your hooks to log raw responses.
    ```typescript
    useOffers(zoneId, {
      onError: (err) => console.log("Query Failed:", err.response?.data)
    })
    ```
3.  **NativeWind Debugging**: If styles aren't applying:
      * Check if `tailwind.config.js` includes the path to your component.
      * Ensure you are using `className`, not `style`.

### General Debugging Steps

1.  **Reproduce via Test**: Write a new failing test case that reproduces the bug.
2.  **Check Logs**:
    ```bash
    # Backend Logs
    npm run start:dev

    # Expo Logs
    npx expo start
    ```
3.  **Update Documentation**: If you find a tricky edge case (especially with Maps or PostGIS), update `docs/backend/schema-rules.md`.

### Required Actions After Significant Implementation

  - **Update Seeder**: If you added a new mandatory column to `Cities` or `Offers`, update `location.seeder.ts`.
  - **Update DTOs**: If API inputs changed, update the Backend DTO and the Frontend TypeScript Interface simultaneously.
  - **Clean up**: Remove any `console.log` or temporary test files (`temp.spec.ts`).