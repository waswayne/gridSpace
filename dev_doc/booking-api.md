# Booking API (v1)

Base URL: `/api/v1/bookings`

This guide documents the booking endpoints consumed by the web and mobile clients. Responses follow the standard envelope:

```json
{
  "success": true,
  "message": "Human readable summary",
  "data": { ... }
}
```

Errors follow the shared format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Optional array of validation messages"]
}
```

## Authentication & Roles

| Endpoint                               | Auth | Roles              | Notes                                                            |
| -------------------------------------- | ---- | ------------------ | ---------------------------------------------------------------- |
| `GET /`                                | Yes  | Any authenticated   | Returns active bookings for the requesting user.                 |
| `GET /host`                            | Yes  | `host`, `admin`     | Lists bookings across spaces owned by the host.                  |
| `POST /`                               | Yes  | Any authenticated   | Guests create bookings for a space.                              |
| `PUT /:id/status`                      | Yes  | `host`, `admin`     | Host-only status transitions (confirm, cancel, mark in-progress).|
| `DELETE /:id/cancel`                   | Yes  | Any authenticated   | Booking owner can cancel prior to start (policy enforced).       |
| `POST /:id/reschedule`                 | Yes  | Any authenticated   | Booking owner reschedules to a new time slot if eligible.        |

> All endpoints use JWT bearer authentication. Attach the access token via `Authorization: Bearer <token>`.

## Domain Overview

- **Booking types**: `hourly`, `daily`, `weekly`, `monthly`. `basePrice` derives from the space rate; total = base + markup (15% default).
- **Statuses**: `pending → upcoming → in_progress → completed`. `cancelled` is a terminal state; `pending` expires after 5 minutes if not confirmed.
- **Payment states**: `pending`, `paid`, `refunded`, `partially_refunded`, `failed`.
- **Refund policy**:
  - Cancel ≥48h before start → 100% refund.
  - Cancel 2–48h before start → 50% refund.
  - Cancel <2h before start → no refund.
- **Virtual flags**: `canCancel` and `canReschedule` expose whether the booking is still modifiable.

## Reference

### 1. List My Bookings

`GET /api/v1/bookings`

Query parameters:

| Name     | Type                | Description                                            |
| -------- | ------------------- | ------------------------------------------------------ |
| `status` | enum                | Optional filter (`pending`, `upcoming`, `in_progress`, `completed`, `cancelled`). |
| `page`   | integer (default 1) | Pagination (1-based).                                  |
| `limit`  | integer (default 10)| Page size (1–100).                                     |

Sample response:

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "_id": "6661d...",
        "spaceId": {
          "_id": "664a...",
          "title": "Ocean View Meeting Room",
          "location": "Lagos",
          "images": ["https://..."],
          "amenities": ["WiFi", "Projector"],
          "capacity": 12,
          "pricePerHour": 15000
        },
        "startTime": "2025-11-12T09:00:00.000Z",
        "endTime": "2025-11-12T13:00:00.000Z",
        "bookingType": "hourly",
        "guestCount": 6,
        "status": "upcoming",
        "paymentStatus": "pending",
        "totalAmount": 69000,
        "hostEarnings": 60000,
        "canCancel": true,
        "canReschedule": true,
        "createdAt": "2025-10-29T08:31:11.812Z",
        "updatedAt": "2025-10-29T08:31:11.812Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBookings": 21,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. List Host Bookings

`GET /api/v1/bookings/host`

- Requires host/admin token. Returns bookings across all active spaces owned by the host. Each record populates guest profile info for dashboards.
- Same query params as user listing (`status`, `page`, `limit`).

### 3. Create Booking

`POST /api/v1/bookings`

Body schema:

| Field             | Type       | Required | Notes                                   |
| ----------------- | ---------- | -------- | --------------------------------------- |
| `spaceId`         | string     | Yes      | Mongo ObjectId of the space.            |
| `startTime`       | ISO string | Yes      | Future timestamp.                       |
| `endTime`         | ISO string | Yes      | Must be after `startTime`.              |
| `bookingType`     | enum       | No       | Defaults to `hourly`.                   |
| `guestCount`      | integer    | No       | Defaults to 1; capped by space capacity.|
| `specialRequests` | string     | No       | Optional notes (≤500 chars).            |

Response:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "6661d...",
    "status": "pending",
    "paymentStatus": "pending",
    "expiresAt": "2025-10-29T08:36:11.812Z",
    "userId": "665f...",
    "spaceId": "664a...",
    "startTime": "2025-11-12T09:00:00.000Z",
    "endTime": "2025-11-12T13:00:00.000Z",
    "bookingType": "hourly",
    "guestCount": 4,
    "totalAmount": 46000,
    "hostEarnings": 40000
  }
}
```

Common errors:

- `400 BAD_REQUEST` – validation failure, capacity exceeded, or conflict detected (`"The selected time slot is already booked"`).
- `404 NOT_FOUND` – space no longer available/inactive.

### 4. Update Booking Status (Host/Admin)

`PUT /api/v1/bookings/:id/status`

Body schema:

| Field                | Type   | Required | Notes                                                      |
| -------------------- | ------ | -------- | ---------------------------------------------------------- |
| `status`             | enum   | Yes      | One of `upcoming`, `in_progress`, `completed`, `cancelled`.|
| `hostNotes`          | string | No       | Extra context stored on the booking.                      |
| `cancellationReason` | enum   | Cond.    | Required when `status = cancelled` (`host_request`, etc.). |

Successful response shape mirrors `BookingResponse` (updated booking object).

- Invalid transitions (e.g., upcoming → completed) return `400` with `"Cannot transition"` message.
- Modifying a booking not owned by the host returns `403`.

### 5. Cancel Booking (Guest)

`DELETE /api/v1/bookings/:id/cancel`

- Cancels only if `status` is `pending` or `upcoming` and start time is ≥2h away.
- Response includes refund metadata:

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "_id": "6661d...",
      "status": "cancelled",
      "paymentStatus": "refunded"
    },
    "refund": {
      "amount": 46000,
      "type": "full_refund_48h"
    }
  }
}
```

Errors:

- `400 BAD_REQUEST` – booking too close to start (`"Cannot cancel booking within 2 hours"`).
- `403 FORBIDDEN` – user trying to cancel someone else’s booking.

### 6. Reschedule Booking

`POST /api/v1/bookings/:id/reschedule`

Body schema:

| Field           | Type       | Required | Notes                               |
| --------------- | ---------- | -------- | ----------------------------------- |
| `newStartTime`  | ISO string | Yes      | Must be future date.                |
| `newEndTime`    | ISO string | Yes      | Must be after `newStartTime`.       |
| `reason`        | string     | No       | Optional note.                      |

- Checks conflict against other active bookings on the same space (excluding current booking).
- Records the change in `rescheduleHistory`.

Response mirrors the booking object with updated times.

## Status Reference

| Status        | Description                                | Typical Transitions                     |
| ------------- | ------------------------------------------ | --------------------------------------- |
| `pending`     | Newly created; awaiting host confirmation or payment. | → `upcoming`, `cancelled`. Expires after 5 minutes. |
| `upcoming`    | Confirmed future booking.                  | → `in_progress`, `cancelled`.           |
| `in_progress` | Ongoing booking (current time within window). | → `completed`.                           |
| `completed`   | Finished booking.                          | Terminal.                               |
| `cancelled`   | Cancelled by host/user/system.             | Terminal.                               |

## Payment Status Reference

| Payment Status        | Meaning                                          |
| --------------------- | ------------------------------------------------ |
| `pending`             | Awaiting payment confirmation.                   |
| `paid`                | Payment settled; booking ready to start.         |
| `failed`              | Payment attempt failed.                          |
| `refunded`            | Full refund issued.                              |
| `partially_refunded`  | Partial refund (e.g., 50%).                       |

## Notes for Frontend Integrators

- **Polling**: For pending bookings awaiting host confirmation, poll `GET /bookings` every 10–15s (or use web sockets when available) until status changes.
- **Conflict messaging**: Surface user-friendly copy for conflict errors (HTTP 400, message `"The selected time slot is already booked"`).
- **Time zone**: All timestamps are ISO strings in UTC; convert to local time on the client.
- **Virtual flags**: Trust `canCancel` and `canReschedule` to enable/disable UI actions instead of duplicating cutoff logic.
- **Host dashboards**: Use `GET /bookings/host` for lists and `PUT /bookings/:id/status` for confirmations/cancellations.
- **Swagger UI**: Full schema examples are available at `/docs` in local dev.
