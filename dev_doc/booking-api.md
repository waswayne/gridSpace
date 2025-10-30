# Booking API (v1)

> Base path: `/api/v1/bookings`

### Quick navigation
- [Overview](#overview)
- [Conventions & request headers](#conventions--request-headers)
- [Endpoint catalogue](#endpoint-catalogue)
- [Endpoint details](#endpoint-details)
- [Status & payment reference](#status--payment-reference)
- [Frontend integration tips](#frontend-integration-tips)

---

## Overview
Bookings connect guests to host spaces. The service manages availability checks, pricing, refunds, and host workflows. Every JSON response uses the standard envelope:

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {}
}
```

On failure:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": []
  }
}
```

### Domain primer
- **Booking types**: `hourly`, `daily`, `weekly`, `monthly` (default `hourly`).
- **Lifecycle**: `pending → upcoming → in_progress → completed` (`cancelled` is terminal; `pending` auto-expires after 5 mins if not confirmed).
- **Payment states**: `pending`, `paid`, `refunded`, `partially_refunded`, `failed`.
- **Refund policy**: ≥48h → 100%, 2–48h → 50%, <2h → 0% (reflected in response metadata).
- **Virtual helpers**: `canCancel` / `canReschedule` save the frontend from duplicating cutoff logic.

---

## Conventions & request headers

| Item | Value |
| --- | --- |
| Auth | `Authorization: Bearer <accessToken>` (required on every endpoint) |
| Content type | `application/json` |
| Pagination | `page` (1-based) + `limit` (1–100, default 10) |
| Date/time | ISO 8601 UTC strings |

---

## Endpoint catalogue

| Method & path | Roles | Description |
| --- | --- | --- |
| `GET /` | Any authenticated | Return bookings for the requesting user (guest view).
| `GET /host` | `host`, `admin` | Host dashboard listing across owned spaces.
| `POST /` | Any authenticated | Create a booking for a space (conflict-checked).
| `PUT /:id/status` | `host`, `admin` | Transition booking lifecycle state.
| `DELETE /:id/cancel` | Booking owner | Cancel ahead of start; refunds applied.
| `POST /:id/reschedule` | Booking owner | Move an upcoming booking to a new slot.

---

## Endpoint details

### List my bookings — `GET /`

Query params:

| Name | Type | Notes |
| --- | --- | --- |
| `status` | enum | `pending`, `upcoming`, `in_progress`, `completed`, `cancelled` |
| `page` | integer | 1-based (default 1) |
| `limit` | integer | Default 10, max 100 |

Response excerpt:

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
        "createdAt": "2025-10-29T08:31:11.812Z"
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

### List host bookings — `GET /host`
- Requires host/admin token.
- Query params identical to `GET /`.
- Each entry pre-populates guest profile data for dashboards.

### Create booking — `POST /`

Body:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `spaceId` | string | Yes | Mongo ObjectId of the target space. |
| `startTime` | ISO string | Yes | Must be in the future. |
| `endTime` | ISO string | Yes | After `startTime`. |
| `bookingType` | enum | No | Defaults to `hourly`. |
| `guestCount` | integer | No | Defaults to 1, capped by space capacity. |
| `specialRequests` | string | No | ≤500 chars, plain text. |

Success payload mirrors the booking object and includes pricing breakdown (totalAmount, hostEarnings). Conflicts surface as `400 BAD_REQUEST` with message `"The selected time slot is already booked"`.

### Update booking status — `PUT /:id/status`

Body:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `status` | enum | Yes | `upcoming`, `in_progress`, `completed`, `cancelled`. |
| `hostNotes` | string | No | Persisted on the booking for internal reference. |
| `cancellationReason` | enum | Conditional | Mandatory when setting `status=cancelled`. |

Invalid transitions return `400` with a clarifying message; attempting to modify a booking owned by another host returns `403`.

### Cancel booking — `DELETE /:id/cancel`
- Only booking owner can cancel.
- Allowed when state is `pending` or `upcoming` and start time is ≥2h away.
- Response includes `data.refund` metadata to drive UI copy (amount + policy code).

### Reschedule booking — `POST /:id/reschedule`

Body:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `newStartTime` | ISO string | Yes | Must be in the future. |
| `newEndTime` | ISO string | Yes | After `newStartTime`. |
| `reason` | string | No | Optional note shown to hosts. |

The service validates conflicts (excluding the current booking) and appends an entry to `rescheduleHistory`.

---

## Status & payment reference

| Booking status | Description | Typical transitions |
| --- | --- | --- |
| `pending` | Awaiting host confirmation/payment. Auto-expires after 5 mins.| → `upcoming`, `cancelled` |
| `upcoming` | Confirmed and scheduled for the future. | → `in_progress`, `cancelled` |
| `in_progress` | Current time within booking window. | → `completed` |
| `completed` | Finished booking. | Terminal |
| `cancelled` | Cancelled by host/user/system. | Terminal |

| Payment status | Meaning |
| --- | --- |
| `pending` | Awaiting payment confirmation. |
| `paid` | Funds settled; booking ready. |
| `refunded` | Full refund issued. |
| `partially_refunded` | Partial refund (typically 50%). |
| `failed` | Payment attempt failed. |

---

## Frontend integration tips

1. **Polling** — Poll `GET /bookings` while a booking remains `pending` (10–15s) until status stabilises. Real-time sockets TBD.
2. **Conflict UX** — Show human-friendly copy when receiving `400` with `"The selected time slot is already booked"`.
3. **Time zones** — Convert all ISO timestamps from UTC to the viewer’s locale.
4. **Action gating** — Use `canCancel` / `canReschedule` booleans instead of re-implementing policy rules client-side.
5. **Host dashboards** — Combine `GET /host` with `PUT /:id/status` to power confirmation/cancellation flows.
6. **Swagger reference** — Full schema examples live at `/docs` during local development.
