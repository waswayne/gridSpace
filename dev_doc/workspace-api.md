# Workspace API (v1)

> Base path: `/api/v1/workspaces`

### Quick navigation
- [Overview](#overview)
- [Conventions & headers](#conventions--headers)
- [Endpoint catalogue](#endpoint-catalogue)
- [Endpoint details](#endpoint-details)
- [Enumerations](#enumerations)
- [Validation & error notes](#validation--error-notes)
- [Manual QA checklist](#manual-qa-checklist)

---

## Overview
The workspace service powers search, discovery, and host management flows. All responses follow the shared envelope:

```json
{
  "success": true,
  "message": "Spaces retrieved successfully",
  "data": {}
}
```

Errors include structured metadata:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

### Domain primer
- Public catalogue is unauthenticated; host CRUD requires bearer tokens.
- Host prerequisites for creation/update/delete: role `host`, `onboardingCompleted = true`, <10 active spaces.
- Space media is stored in Cloudinary (memory upload → transform → CDN URL).
- Catalogue requests are logged to `SearchAnalytics` asynchronously; clients do not need to react.

---

## Conventions & headers

| Item | Value |
| --- | --- |
| Auth | Public GETs are open. All other routes require `Authorization: Bearer <accessToken>` |
| Content type | JSON for reads; `multipart/form-data` for create/update uploads |
| Pagination | `page` (1-based) + `limit` (default 12, max 50 for catalogue) |
| Sorting | `sortBy` supporting `newest`, `price_low_high`, `price_high_low`, `rating`, `most_popular` |
| Currency | All pricing expressed in Nigerian Naira (₦) |

Rate limiting: `POST /` additionally passes through a per-host limiter. Expect HTTP 429 on abuse.

---

## Endpoint catalogue

| Method & path | Auth required | Roles | Description |
| --- | --- | --- | --- |
| `GET /` | No | Any | Public catalogue search. |
| `GET /:id` | No | Any | Fetch public details for active spaces. |
| `GET /my/spaces` | Yes | `host`, `admin` | List the authenticated host’s active spaces. |
| `POST /` | Yes | `host`, `admin` | Create a workspace (multipart form). |
| `PATCH /:id` | Yes | `host`, `admin` | Update details/images; host must own the space. |
| `DELETE /:id` | Yes | `host`, `admin` | Soft delete (`isActive=false`). |

---

## Endpoint details

### Search spaces — `GET /`

Query parameters:

| Name | Type | Notes |
| --- | --- | --- |
| `location` | string | Case-insensitive substring match. |
| `priceMin` / `priceMax` | number | Both required when filtering by price; values in ₦. |
| `capacity` | integer | Minimum seating capacity. |
| `amenities` | string or string[] | Amenity enums (see table below). |
| `purposes` | string or string[] | Purpose enums. |
| `page` | integer | 1-based (default 1). |
| `limit` | integer | Default 12, max 50. |
| `sortBy` | enum | `newest` (default) or pricing/rating options. |

Response excerpt:

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
        }
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

### Get workspace details — `GET /:id`
- Returns the full workspace object when `isActive=true`.
- Soft-deleted/missing spaces return `404`.
- Populates host profile metadata for attribution.

### List host spaces — `GET /my/spaces`
- Requires host/admin token.
- Query params mirror catalogue pagination; filters default to the authenticated host.
- Use for host dashboards and management UIs.

### Create workspace — `POST /`
- Requires host/admin token.
- `multipart/form-data` with up to 5 `images` fields (Cloudinary upload).
- Host prerequisites: onboarding complete, fewer than 10 active spaces.

Body reference:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | Yes | 5–100 chars. |
| `description` | string | Yes | 10–1000 chars. |
| `location` | string | Yes | 3–200 chars. |
| `address` | string | No | Max 300 chars. |
| `pricePerHour` | number | Yes | ₦500 – ₦50,000. |
| `capacity` | integer | Yes | 1 – 100. |
| `amenities[]` | string[] | No | Amenity enum values. |
| `purposes[]` | string[] | No | Purpose enum values. |
| `timeSlots[x][day]` | enum | Yes | `monday` … `sunday`. |
| `timeSlots[x][startTime]` | string | Yes | `HH:MM` (24h). |
| `timeSlots[x][endTime]` | string | Yes | `HH:MM` (24h). |
| `images` | file[] | No | Up to 5 files, each ≤5 MB. |

Successful creation returns the newly persisted workspace. Failures include:
- `400 BAD_REQUEST` for validation issues or exceeding image/space limits.
- `403 FORBIDDEN` when host prerequisites fail.
- `429 TOO_MANY_REQUESTS` when rate limited.

### Update workspace — `PATCH /:id`
- Requires host/admin token; hosts can only modify owned spaces.
- `multipart/form-data`. Only provided fields are updated.
- Same validation ranges as creation (at least one field required).

### Delete workspace — `DELETE /:id`
- Soft delete (`isActive=false`).
- Returns `200` with message "Space deleted successfully". Subsequent `GET /:id` returns 404.

---

## Enumerations

| Amenities | Purposes | Time slot days |
| --- | --- | --- |
| `WiFi` | `Remote Work` | `monday` |
| `Projector` | `Study Session` | `tuesday` |
| `Whiteboard` | `Team Meetings` | `wednesday` |
| `Air Conditioning` | `Networking` | `thursday` |
| `Power Backup` | `Presentations` | `friday` |
| `Parking` | `Creative Work` | `saturday` |
| `Coffee/Tea` | `Interview` | `sunday` |
| `Printer/Scanner` | `Training` |  |
| `Conference Phone` | `Client Meeting` |  |
| `Monitor` |  |  |
| `Kitchen` |  |  |
| `Restroom` |  |  |

---

## Validation & error notes
- **Images**: More than 5 files yields `400` with message "Maximum 5 images allowed per space".
- **Pricing**: Outside ₦500–₦50,000 is rejected with `400`.
- **Time slots**: `startTime`/`endTime` must match `^([01]\d|2[0-3]):([0-5]\d)$` and `start < end`.
- **Host limit**: 10 active spaces per host. The 11th attempt returns `400` with a descriptive message.
- **Search analytics**: Logging failures never bubble to clients; errors are captured in logs.

---

## Manual QA checklist

1. `GET /api/v1/workspaces?location=lagos` → 200 with pagination meta.
2. `GET /api/v1/workspaces/{id}` for inactive space → 404.
3. `GET /api/v1/workspaces/my/spaces` (host token) → 200 scoped list.
4. `POST /api/v1/workspaces` (multipart) until the host reaches 10 active spaces → final request fails with descriptive `400`.
5. `PATCH /api/v1/workspaces/{id}` → 200 with updated fields.
6. `DELETE /api/v1/workspaces/{id}` → 200, subsequent `GET /:id` returns 404.

Mirror these steps in Postman or automated smoke tests to validate frontend integrations.
