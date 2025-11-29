# API Structure & Standards

This document defines the strict API response format and error handling protocols for Offerify.

## 1. Global Prefix & Versioning

All API routes must be prefixed with `/api`.
Versioning is handled via the URI path if necessary (e.g., `/api/v1/...`), but currently, we operate on a single version.

**Base URL:** `http://localhost:3000/api`

## 2. Standard Response Format

Every successful API response **MUST** follow this JSON structure:

```typescript
export interface ApiResponse<T> {
  data: T;           // The actual payload (Object or Array)
  meta?: {           // Optional metadata (Pagination, etc.)
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message: string;   // Human-readable success message
}
```

### Example: Get Single Offer
```json
{
  "data": {
    "id": "uuid-1234",
    "title": "50% Off Burger",
    "price": 150
  },
  "message": "Offer retrieved successfully"
}
```

### Example: Get List of Offers (Paginated)
```json
{
  "data": [
    { "id": "1", "title": "Offer A" },
    { "id": "2", "title": "Offer B" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  },
  "message": "Offers retrieved successfully"
}
```

## 3. Error Handling

We use standard HTTP status codes. Errors must return a consistent JSON structure.

### Error Response Format
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too short"], // Array of strings for validation errors
  "error": "Bad Request"
}
```

### Common Status Codes
- **200 OK**: Success (GET, PATCH).
- **201 Created**: Resource created (POST).
- **400 Bad Request**: Validation failure (class-validator).
- **401 Unauthorized**: Missing or invalid JWT.
- **403 Forbidden**: Valid JWT but insufficient permissions (RBAC).
- **404 Not Found**: Resource does not exist.
- **409 Conflict**: Duplicate resource (e.g., Email already exists).
- **500 Internal Server Error**: Unhandled exception.

## 4. DTO Validation

All input payloads must be validated using `class-validator`.

```typescript
export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

## 5. Query Parameters

For filtering and pagination, use standard query params:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Field to sort by (e.g., `createdAt`)
- `order`: `ASC` or `DESC`

Example: `GET /api/offers?page=2&limit=20&sort=price&order=ASC`
