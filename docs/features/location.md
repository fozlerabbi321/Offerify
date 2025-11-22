# Location Feature Documentation

The Location module manages the Country-State-City (CSC) hierarchy and provides geospatial search capabilities for the Offerify platform.

## 🌍 Overview

Offerify operates on a hyper-local model where deals are discovered within specific "Zones" (Cities). The system uses a strict hierarchy:
`Country` -> `State` -> `City` (Zone)

## 🏗️ Data Model

### Entities

| Entity | Table | Description | Key Fields |
| :--- | :--- | :--- | :--- |
| **Country** | `countries` | Top-level administrative unit. | `id`, `name`, `iso_code` (ISO 3166-1 alpha-3) |
| **State** | `states` | First-level administrative division. | `id`, `name`, `country_id` |
| **City** | `cities` | The "Zone" where offers exist. | `id`, `name`, `state_id`, `center_point` (Geography Point) |

### Geospatial Data
- **Technology**: PostGIS
- **Type**: `GEOGRAPHY(POINT, 4326)`
- **Logic**: Uses `ST_DWithin` for radius search and `ST_Distance` for sorting.

## 🔌 API Reference

### Get Nearest Zone
Finds the nearest City (Zone) to the user's current location.

- **Endpoint**: `GET /location/nearest`
- **Query Parameters**:
  - `lat` (number, required): Latitude
  - `long` (number, required): Longitude
- **Response**: `City` object or `404 Not Found`

#### Example Request
\`\`\`http
GET /location/nearest?lat=23.7925&long=90.4078
\`\`\`

## 🛠️ Development

### Seeding Data
To populate the database with initial data (Bangladesh, Dhaka Division, and key Zones):

\`\`\`bash
npm run seed:location
\`\`\`

### Running Tests
The module follows TDD. To run unit tests:

\`\`\`bash
npm run test -- tests/unit/features/location/location.service.spec.ts
\`\`\`
