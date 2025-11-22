# Offers Feature Documentation

The Offers module manages deal creation and discovery for vendors on the Offerify platform. It implements a **Single Table Inheritance** strategy to handle different offer types.

## 🎯 Overview

Offerify supports three types of offers:
- **Discount Offers**: Percentage-based discounts (e.g., 50% off)
- **Coupon Offers**: Code-based promotions (e.g., "FRIES24")
- **Voucher Offers**: Fixed-value vouchers (e.g., 100 BDT off)

## 🏗️ Data Model

### Entities

| Entity | Table | Description | Key Fields |
| :--- | :--- | :--- | :--- |
| **User** | `users` | Base user account. | `id`, `email`, `password_hash`, `role` (customer, vendor, admin) |
| **VendorProfile** | `vendor_profiles` | Vendor business profile with location. | `id`, `business_name`, `slug`, `location` (Geography Point), `city_id`, `user_id` |
| **Offer** | `offers` | Base offer entity (Single Table Inheritance). | `id`, `title`, `description`, `type`, `vendor_id`, `is_active` |
| **DiscountOffer** | `offers` | Discount with percentage. | Inherits from `Offer` + `discount_percentage` |
| **CouponOffer** | `offers` | Coupon with code. | Inherits from `Offer` + `coupon_code` |
| **VoucherOffer** | `offers` | Voucher with fixed value. | Inherits from `Offer` + `voucher_value` |

### Single Table Inheritance
All offer types are stored in the `offers` table with a `type` discriminator column:
- `type = 'discount'` → DiscountOffer
- `type = 'coupon'` → CouponOffer
- `type = 'voucher'` → VoucherOffer

### Geospatial Integration
- **VendorProfile** uses PostGIS `GEOGRAPHY(POINT, 4326)` for location
- **Spatial Index**: Enabled on `location` column
- **Zone Association**: Each vendor is linked to a `city_id` (Zone)

## 🔌 API Reference

### Create Offer
Creates a new offer for a vendor.

- **Endpoint**: `POST /offers`
- **Authentication**: Required (Vendor role)
- **Request Body**: `CreateOfferDto`

#### CreateOfferDto

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `title` | string | ✅ | Offer title | "50% Off Whopper" |
| `description` | string | ✅ | Offer description | "Get 50% off on your favorite Whopper burger." |
| `type` | enum | ✅ | Offer type: `discount`, `coupon`, `voucher` | `discount` |
| `vendorId` | uuid | ✅ | Vendor profile ID | `0fd62dc5-b7aa-4d10-a0e2-d5b0f2ac1213` |
| `discountPercentage` | number | ⚠️ | For discount offers (0-100) | `50` |
| `couponCode` | string | ⚠️ | For coupon offers | `FRIES24` |
| `voucherValue` | number | ⚠️ | For voucher offers (minimum 0) | `100` |

⚠️ = Required based on `type`

#### Example Request: Discount Offer
```json
POST /offers
{
  "title": "50% Off Whopper",
  "description": "Get 50% off on your favorite Whopper burger.",
  "type": "discount",
  "vendorId": "0fd62dc5-b7aa-4d10-a0e2-d5b0f2ac1213",
  "discountPercentage": 50
}
```

#### Example Request: Coupon Offer
```json
POST /offers
{
  "title": "Free Fries",
  "description": "Use code FRIES24 for free fries.",
  "type": "coupon",
  "vendorId": "0fd62dc5-b7aa-4d10-a0e2-d5b0f2ac1213",
  "couponCode": "FRIES24"
}
```

#### Example Request: Voucher Offer
```json
POST /offers
{
  "title": "100 BDT Voucher",
  "description": "Get 100 BDT off on orders above 500 BDT.",
  "type": "voucher",
  "vendorId": "0fd62dc5-b7aa-4d10-a0e2-d5b0f2ac1213",
  "voucherValue": 100
}
```

## 🛠️ Development

### Seeding Data
To populate the database with vendor and offer data:

```bash
npm run seed:vendor
```

This will create:
- ✅ A sample vendor user
- ✅ A vendor profile (Burger King Gulshan) with PostGIS location
- ✅ 3 sample offers (Discount, Coupon, Voucher)

### Running Tests
The module follows **TDD (Test-Driven Development)**. To run unit tests:

```bash
npm run test:watch
```

Or run specific test file:

```bash
npm run test -- tests/unit/features/offers/offers.service.spec.ts
```

### Test Coverage
- ✅ Create Discount Offer
- ✅ Create Coupon Offer
- ✅ Create Voucher Offer

## 🔐 Architecture Constraints

1. **Vendor-Offer Relationship**: Each offer MUST be linked to a `vendor_id`
2. **Zone Association**: Vendors MUST be linked to a `city_id` (Zone)
3. **Single Table Inheritance**: All offers share the same table with type discrimination
4. **PostGIS**: Vendor location MUST use `GEOGRAPHY(POINT, 4326)` type

## 📋 Future Enhancements
- [ ] Smart Feed: Filter offers by `cityId` and `stateId`
- [ ] Voucher Claim Limit: Implement atomic claim counter
- [ ] Offer Expiration: Add `valid_until` field
- [ ] Image Uploads: Add `image_url` field for offer images
