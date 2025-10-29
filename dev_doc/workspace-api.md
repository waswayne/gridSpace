# Workspace API (v1)

Base URL: `/api/v1/workspaces`

This document describes the endpoints the frontend uses to search, retrieve, and manage workspaces ("spaces"). All responses are JSON and wrap payloads in the shape below:

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": { ... }
}
```

Errors follow the standard shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": ["...optional details..."]
  }
}
```

## Authentication & Roles

| Endpoint                                           | Auth Required | Roles             | Notes                                                                     |
| -------------------------------------------------- | ------------- | ----------------- | ------------------------------------------------------------------------- |
| `GET /`                                            | No            | Any               | Public catalogue search.                                                  |
| `GET /:id`                                         | No            | Any               | Public details for active spaces only.                                    |
| `GET /my/spaces`                                   | Yes           | `host`, `admin`   | Returns authenticated host’s active spaces.                               |
| `POST /`                                           | Yes           | `host`, `admin`   | Creates workspace. Host must be onboarded and under active-space limit.   |
| `PATCH /:id`                                       | Yes           | `host`, `admin`   | Host must own the space (admins bypass).                                  |
| `DELETE /:id`                                      | Yes           | `host`, `admin`   | Soft deletes (sets `isActive=false`).                                     |

> Rate limiting: `POST /` additionally passes through the global rate limiter and the workspace creation limiter (`validateHostSpaceCreation`). Expect HTTP 429 for excessive calls.

## Reference

### 1. Search Workspaces

`GET /api/v1/workspaces`

Query parameters:

| Name        | Type                | Description                                                      |
| ----------- | ------------------- | ---------------------------------------------------------------- |
| `location`  | string              | Case-insensitive substring match.                               |
| `priceMin`  | number              | Minimum hourly rate (₦). Requires `priceMax`.                    |
| `priceMax`  | number              | Maximum hourly rate (₦). Requires `priceMin`.                    |
| `capacity`  | integer             | Minimum seating capacity.                                       |
| `amenities` | string or string[]  | One or more amenity enums (`WiFi`, `Projector`, …).              |
| `purposes`  | string or string[]  | One or more purpose enums (`Remote Work`, `Team Meetings`, …).   |
| `page`      | integer (default 1) | 1-based page index (max 50 items per page).                      |
| `limit`     | integer (default 12)| Page size (1–50).                                                |
| `sortBy`    | enum                | `newest` (default), `price_low_high`, `price_high_low`, `rating`, `most_popular`. |

Successful response sample:

```json
{
  "success": true,
  "message": "Spaces retrieved successfully",
  "data": {
    "spaces": [
      {
        "_id": "664a1d...",
        "title": "Sunny Meeting Room",
        "description": "Seats 10 with projector",
        "location": "Lagos",
        "address": "123 Test Street",
        "pricePerHour": 12000,
        "images": ["https://..."],
        "amenities": ["WiFi", "Projector"],
        "purposes": ["Team Meetings"],
        "capacity": 12,
        "timeSlots": [{ "day": "monday", "startTime": "09:00", "endTime": "17:00" }],
        "isActive": true,
        "hostId": {
          "_id": "663f...",
          "fullname": "Ada Lovelace",
          "profilePic": "https://...",
          "emailVerified": true
        },
        "createdAt": "2025-10-12T08:12:11.281Z",
        "updatedAt": "2025-10-19T11:45:02.993Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalSpaces": 42,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

> 🔍 Search analytics: every catalogue request logs a non-blocking event to `SearchAnalytics` (user/session, filters, result count). No action needed from the frontend, but repeated requests will appear in metrics.

### 2. Get Workspace Details

`GET /api/v1/workspaces/:id`

- Returns the full workspace document (same shape as search results) when `isActive = true`.
- Soft-deleted or missing spaces respond with HTTP 404.
- Populates host profile (name, photo, email verification, createdAt).

```json
{
  "success": true,
  "message": "Space details retrieved successfully",
  "data": { /* workspace object */ }
}
```

### 3. Get Host’s Spaces

`GET /api/v1/workspaces/my/spaces`

Headers:

```
Authorization: Bearer <host-access-token>
```

Query parameters mirror catalogue search (`page`, `limit` etc.), but filters default to all active spaces owned by the authenticated host. Response payload matches the catalogue pagination structure.

### 4. Create Workspace

`POST /api/v1/workspaces`

- Auth required (`host` or `admin`).
- Content type: `multipart/form-data` (images uploaded via `images`).
- Max 5 images per request; each image processed through Cloudinary.
- Host prerequisites: role = `host`, `onboardingCompleted = true`, fewer than 10 active spaces.

Body fields:

| Field          | Type                | Required | Notes                                                    |
| -------------- | ------------------- | -------- | -------------------------------------------------------- |
| `title`        | string              | Yes      | 5–100 chars.                                             |
| `description`  | string              | Yes      | 10–1000 chars.                                           |
| `location`     | string              | Yes      | 3–200 chars.                                             |
| `address`      | string              | No       | Max 300 chars.                                           |
| `pricePerHour` | number              | Yes      | ₦500 – ₦50,000.                                          |
| `capacity`     | integer             | Yes      | 1 – 100.                                                 |
| `amenities[]`  | string[]            | No       | Values from amenities enum (see table below).            |
| `purposes[]`   | string[]            | No       | Values from purposes enum.                               |
| `timeSlots[x][day]` | enum          | Yes      | `monday` … `sunday`.                                     |
| `timeSlots[x][startTime]` | string  | Yes      | `HH:MM` 24h format.                                      |
| `timeSlots[x][endTime]`   | string  | Yes      | `HH:MM` 24h format.                                      |
| `images`       | file[]              | No       | Up to 5 files.                                           |

Successful response:

```json
{
  "success": true,
  "message": "Space created successfully",
  "data": { /* newly created workspace */ }
}
```

Common failure codes:
- `400 BAD_REQUEST` – Validation error (invalid payload, more than 5 images, host space cap reached).
- `403 FORBIDDEN` – User not host/onboarding incomplete.
- `429 TOO_MANY_REQUESTS` – Rate limit exceeded.

### 5. Update Workspace

`PATCH /api/v1/workspaces/:id`

- Auth required (`host` or `admin`).
- Content type: `multipart/form-data`. Absent fields remain unchanged.
- Host must own the workspace unless admin.
- Same validation ranges as creation; at least one field required.

Sample payload (partial update):

```
title = Focus Pods (2nd Floor)
pricePerHour = 8000
amenities[] = WiFi
amenities[] = Whiteboard
```

Response mirrors creation (`200 OK`). 404 returned if workspace is inactive/not found.

### 6. Delete Workspace

`DELETE /api/v1/workspaces/:id`

- Auth required (`host` owning the space, or admin).
- Performs soft delete (`isActive=false`).
- Returns `200` with message *"Space deleted successfully"*; subsequent detail requests return 404.

## Enumerations

| Amenities Enum        | Purposes Enum       | Time Slot Days |
| --------------------- | ------------------- | -------------- |
| `WiFi`                | `Remote Work`       | `monday`       |
| `Projector`           | `Study Session`     | `tuesday`      |
| `Whiteboard`          | `Team Meetings`     | `wednesday`    |
| `Air Conditioning`    | `Networking`        | `thursday`     |
| `Power Backup`        | `Presentations`     | `friday`       |
| `Parking`             | `Creative Work`     | `saturday`     |
| `Coffee/Tea`          | `Interview`         | `sunday`       |
| `Printer/Scanner`     | `Training`          |                |
| `Conference Phone`    | `Client Meeting`    |                |
| `Monitor`             |                     |                |
| `Kitchen`             |                     |                |
| `Restroom`            |                     |                |

## Validation & Error Notes

- **Images**: Exceeding 5 uploads returns HTTP 400 with message `"Maximum 5 images allowed per space"`.
- **Price range**: Requests outside ₦500–₦50,000 fail validation.
- **Time slots**: Both `startTime` and `endTime` must match regex `^([01]\d|2[0-3]):([0-5]\d)$`.
- **Host limit**: 10 active spaces per host. The 11th request returns 400 and message `"You have reached the maximum limit of 10 active spaces..."`.
- **Search analytics**: Logging errors never surface to clients; they are captured internally via Winston.

## Quick Testing Checklist

- `GET /api/v1/workspaces?location=lagos` → 200 with pagination.
- `GET /api/v1/workspaces/{id}` (inactive) → 404.
- `GET /api/v1/workspaces/my/spaces` with host token → 200, only own spaces.
- `POST /api/v1/workspaces` (multipart) with host token → 201 until active count reaches 10.
- `PATCH /api/v1/workspaces/{id}` → 200, returns updated doc.
- `DELETE /api/v1/workspaces/{id}` → 200, subsequent GET 404.

Use these expectations when wiring frontend requests or running Postman smoke checks.
