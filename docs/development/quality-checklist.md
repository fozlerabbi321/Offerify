# Quality Assurance & TDD Checklist

## Mandatory Checklist

### Before Starting Any Task

  - [ ] **Read the Bible**: Consult `docs/architecture/SYSTEM_DESIGN.md` to understand the **CSC Location Model** and **Auto-Detect Logic**.
  - [ ] **TDD Setup**: Identify the functionality and write the **Failing Test Case (Red)** first.
  - [ ] **Schema Check**: If touching the DB, read `docs/backend/schema-rules.md` to ensure compliance (e.g., `geography` types, UUIDs).
  - [ ] **Zone Context**: Understand how the feature interacts with the "Current Zone" (City ID).
  - [ ] **Check for Reusability**: Search `src/common` or `src/components/shared` to avoid duplicating logic/UI.

### Before Sending a Pull Request / Committing

  - [ ] **Strict TDD Compliance**: Ensure every new feature has a corresponding `.spec.ts` or `.test.tsx` file.
  - [ ] **No "Orphan" Data**: Ensure all created Offers/Vendors are linked to a valid `city_id`.
  - [ ] **Frontend-Backend Sync**: Verify that Frontend Types (`src/types`) match the Backend DTOs exactly.
  - [ ] **No Hardcoded Secrets**: Ensure `.env` variables are used for keys/secrets.

### When Writing Code

**Backend (NestJS + PostGIS)**:

  - [ ] **Test First**: Write the test → Run (Fail) → Write Code → Run (Pass) → Refactor.
  - [ ] **Location Data**: NEVER use separate `lat`/`long` float columns. Use `geography(Point, 4326)`.
  - [ ] **Unified Offers**: Differentiate Offers using the `type` Enum (`discount`, `coupon`, `voucher`), do not create new tables.
  - [ ] **DTO Validation**: Use `class-validator` for all inputs.
  - [ ] **Imports**: Use absolute imports (`src/modules/...`) instead of relative (`../../`).
  - [ ] **Search**: Do not use SQL `LIKE` for text search; implement Typesense syncing.

**Frontend (Expo + NativeWind)**:

  - [ ] **Styling**: Use **NativeWind** classes (`className="..."`) exclusively. Avoid `StyleSheet.create` unless strictly necessary for reanimated styles.
  - [ ] **State Management**: Use **TanStack Query** for all server data (Offers, Feeds). Do not store API data in `useState` or Redux.
  - [ ] **Responsiveness**: Test UI on both iOS (sim) and Android (emulator).
  - [ ] **Maps**: Ensure Map Markers are clustered if displaying \> 50 items.
  - [ ] **Type Safety**: No `any` types. Define interfaces in `src/types`.

### Before Completing Any Task

**Backend Verification**:

  - [ ] Run `npm run lint` (Must be 0 errors).
  - [ ] Run `npm run test` (All Unit Tests pass).
  - [ ] Run `npm run test:e2e` (Verify PostGIS/Database logic).
  - [ ] Run `npm run build` (Ensure no compilation errors).

**Frontend Verification**:

  - [ ] Run `npm run lint` (Fix styling/logic warnings).
  - [ ] Run `npm run type-check` (Crucial for TypeScript safety).
  - [ ] Verify the UI matches the design on different screen sizes.

**Documentation**:

  - [ ] Update `docs/backend/schema-rules.md` if you changed the DB Schema.
  - [ ] Add Swagger decorators (`@ApiProperty`) to new DTOs.

## Testing Implementation Procedures

### 1\. TDD Cycle (The Code Loop)

1.  **Red:** Run `npm run test:watch`. Create a new test file. Watch it fail.
2.  **Green:** Write minimal code to satisfy the test requirements.
3.  **Refactor:** Clean up the code. Ensure tests remain green.

### 2\. Integration Verification

After finishing the feature, run the full suite:

```bash
# Backend
cd backend
npm run test:e2e  # Verifies DB & Geo logic with real PostGIS

# Frontend
cd frontend
npm run test      # Verifies Components mount correctly
```

### 3\. Local Environment Check

Ensure the application starts cleanly without errors:

```bash
# Backend
npm run start:dev

# Frontend
npx expo start
```

## Quality Metrics

  - **Code Coverage**: Target \> 80% for Business Logic Services.
  - **Geo Query Speed**: "Near Me" queries must execute in **\< 100ms** (Ensure GIST Index is used).
  - **Search Speed**: Typesense results in **\< 50ms**.
  - **Bundle Size**: Minimize large imports (use modular imports for lodash/date-fns).
  - **Linting**: Zero warnings allowed in `main` branch.