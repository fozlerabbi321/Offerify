# Code Style Guidelines

## Code Style Rules

### Less is More (STRICT\!)

  - Prefer concise implementations over verbose ones.
  - If a feature can be implemented in fewer lines without sacrificing maintainability or testability, choose the shorter approach.

### TypeScript for All New Code (MANDATORY\!)

  - **Frontend**: All components must use `.tsx` and strict interfaces (No `any`).
  - **Backend**: All DTOs and Entities must be strictly typed.
  - **Geo-Location**: Use proper GeoJSON types (`Point`, `Polygon`) for PostGIS data.

### NativeWind for Styling (MANDATORY\!)

**DO NOT use `StyleSheet.create` unless absolutely necessary (e.g., Reanimated shared values).**

```tsx
// ❌ BAD - Traditional React Native Styles
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: 'white' },
  text: { fontSize: 18, fontWeight: 'bold' }
});

// ✅ GOOD - NativeWind (Tailwind)
<View className="bg-white p-4">
  <Text className="text-lg font-bold">Offer Title</Text>
</View>
```

### Avoid Unnecessary `useCallback` (IMPORTANT\!)

  - **Do NOT use `useCallback` by default.**
  - Only use it for functions passed to `memo` components or `useEffect` dependencies.

-----

## Guard Clauses for Early Exit (MANDATORY\!)

**ALWAYS use guard clauses instead of nested if-else blocks.**

```typescript
// ❌ BAD - Nested Logic
async createOffer(vendorId: string, dto: CreateOfferDto) {
  const vendor = await this.vendorRepo.findOne(vendorId);
  if (vendor) {
    if (vendor.isVerified) {
      // logic...
    } else {
      throw new ForbiddenException('Vendor not verified');
    }
  } else {
    throw new NotFoundException('Vendor not found');
  }
}

// ✅ GOOD - Guard Clauses
async createOffer(vendorId: string, dto: CreateOfferDto) {
  const vendor = await this.vendorRepo.findOne(vendorId);
  if (!vendor) throw new NotFoundException('Vendor not found');
  
  if (!vendor.isVerified) throw new ForbiddenException('Vendor not verified');

  // Happy path
  return this.offerRepo.save({ ...dto, vendor });
}
```

-----

## Import Order (STRICT\!)

```typescript
// 1. NestJS / Framework imports
import { Injectable, Controller } from '@nestjs/common';

// 2. Third-party libraries
import { Repository } from 'typeorm';
import { Point } from 'geojson'; // PostGIS Types

// 3. Internal Commons (Shared DTOs, Enums)
import { OfferType } from '@/common/enums/offer.enum';
import { BusinessException } from '@/common/exceptions';

// 4. Domain Modules (Entities, Interfaces)
import { Offer } from '@/modules/offers/entities/offer.entity';
import { City } from '@/modules/location/entities/city.entity';
```

-----

## Backend Patterns (NestJS + PostGIS)

### 1\. Entity Naming (Schema Rules)

  - **Table Names**: Plural, snake\_case (e.g., `offer_redemptions`).
  - **Columns**: snake\_case in DB, camelCase in Entity.
  - **Geo Columns**: Must be type `geography`.

<!-- end list -->

```typescript
// ✅ GOOD Entity Definition
@Entity('vendor_profiles')
export class VendorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_name' }) // Explicit name
  businessName: string;

  @Index({ spatial: true }) // GIST Index
  @Column({
    type: 'geography',
    spatialFeatureType: 'POINT',
    srid: 4326,
  })
  location: Point;
}
```

### 2\. Service Layer Isolation

  - **Do not put business logic in Controllers.**
  - **Do not put SQL queries in Controllers.**
  - Use **Services** for logic and **Repositories** for data access.

-----

## Frontend Patterns (Expo + NativeWind)

### 1\. Component Naming

**NEVER use "Component" suffix.**

  - `OfferCard` ✅
  - `OfferCardComponent` ❌

### 2\. Smart vs Dumb Components

  - **Smart (Features):** `FeedList.tsx` (Fetches data via React Query).
  - **Dumb (UI):** `OfferCard.tsx` (Takes props, renders UI, no API calls).

### 3\. Role-Based Navigation

  - Use `app/(customer)`, `app/(vendor)`, `app/(admin)` groups.
  - Do not mix Vendor logic inside Customer screens.

### 4\. API Integration Pattern (TanStack Query)

**Never call `axios` directly in components.** Create a custom hook.

```typescript
// ❌ BAD - Raw API Call
useEffect(() => {
  axios.get('/offers').then(setData);
}, []);

// ✅ GOOD - React Query Hook
const { data: offers, isLoading } = useOffers(zoneId);
```

-----

## Debugging & Testing (TDD)

### 1\. Backend TDD

  - Write the `.spec.ts` file **before** the Service logic.
  - Mock all external dependencies (Repositories, Redis).

<!-- end list -->

```typescript
// Example TDD Spec
it('should throw error if voucher limit exceeded', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValue(mockOffer);
  await expect(service.claimVoucher(user, offerId)).rejects.toThrow(ConflictException);
});
```

### 2\. Clean Up

  - **Remove temporary test files** after feature implementation.
  - **Delete console.logs** before committing.