# 🧭 Product Requirements Document (PRD)

**Product Name:** Workspace Booking Platform\
**Version:** 1.4.0 (Messaging + Payment Phase)\
**Status:** Active Development\
**Last Updated:** October 26, 2025

------------------------------------------------------------------------

## 1. Product Summary

A secure, data-driven platform connecting **hosts** and **renters** for
workspace discovery, booking, communication, and payments.\
The backend uses **Node.js (ES modules)**, **Express.js**, and
**MongoDB**, following **SOLID** and **DRY** design with modular
route--controller--service layers.

------------------------------------------------------------------------

## 2. Core Tech Stack

-   **Backend:** Node.js + Express\
-   **Database:** MongoDB + Mongoose\
-   **Auth:** JWT + Google OAuth\
-   **File Storage:** Cloudinary via Multer\
-   **Payments:** Paystack / Flutterwave\
-   **Validation:** Joi\
-   **Logging:** Winston\
-   **Rate Limiting:** express-rate-limit\
-   **Docs:** Swagger (/api-docs)\
-   **Messaging:** Socket.io (WebSockets) + Fallback REST APIs

------------------------------------------------------------------------

## 3. Roles & User Types

  ------------------------------------------------------------------------
  Role         Description                   Capabilities
  ------------ ----------------------------- -----------------------------
  **User       Books and reviews spaces      Browse, book, chat with host,
  (Renter)**                                 review

  **Host**     Lists spaces and manages      List/update spaces, respond
               bookings                      to messages/reviews

  **Admin**    Oversees platform             Manage users/spaces/reports,
                                             moderate chats
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Core Features (Implemented)

### 🔐 Authentication & User Management

-   Signup/Login (email + password or Google OAuth)\
-   JWT sessions with refresh tokens\
-   Password reset, email verification\
-   Role-based access (`user`, `host`, `admin`)\
-   Onboarding with purposes + location

### 🏠 Spaces Management

-   CRUD for spaces\
-   Max 10 active spaces per host\
-   Advanced search & filtering\
-   Cloudinary image uploads (max 5)\
-   Soft-delete (`isActive:false`)\
-   Pagination + sorting

### 📅 Booking System

-   15 % markup pricing model\
-   Status flow:
    `pending → upcoming → in_progress → completed/cancelled`\
-   TTL cleanup for expired pending bookings\
-   Refund and reschedule logic\
-   Host earnings tracking\
-   Conflict detection via indexes

### ⭐ Reviews System

-   Review after completed booking\
-   Ratings: cleanliness, accuracy, value\
-   Host response option\
-   Eligibility checks

### 🔍 Analytics & Insights

-   Tracks searches, filters, and zero-result queries\
-   Captures user behavior and conversion rates\
-   Dashboard-ready BI data

------------------------------------------------------------------------

## 5. In-Progress / Planned Features

### 💰 Payment & Wallet System (Phase 4)

-   Fund wallet via Paystack/Flutterwave\
-   Escrow-based booking payments\
-   Host payout workflow\
-   Transaction history and analytics

### 🧑‍💼 Admin Panel (Phase 4)

-   Manage users, spaces, reports\
-   Moderate reviews and messages\
-   Delete or suspend accounts

### 🚨 Reports & Moderation (Phase 4)

-   Report fake/inappropriate spaces or messages\
-   Attach evidence (images, screenshots)\
-   Admin status tracking (`pending`, `investigating`, `resolved`)

### 💬 Messaging System (Phase 4) --- New

A real-time communication feature between hosts and renters.

#### Objectives

-   Allow users to chat before and after a booking.\
-   Ensure all messages are linked to a booking or space.\
-   Enable admins to monitor abuse and flag reports.

#### Tech Implementation

-   **Socket.io** for real-time communication\
-   **MongoDB** for message persistence\
-   **Redis (optional)** for scalable WebSocket sessions\
-   **REST Endpoints** for fetching chat history

#### Endpoints (`/api/messages`)

  ---------------------------------------------------------------------------------
  Method            Endpoint                           Description
  ----------------- ---------------------------------- ----------------------------
  `POST`            `/api/messages/send`               Send a message linked to
                                                       booking ID or space ID

  `GET`             `/api/messages/conversation/:id`   Fetch chat history for a
                                                       conversation

  `GET`             `/api/messages/unread`             Fetch unread message count
                                                       for logged-in user

  `PUT`             `/api/messages/:id/read`           Mark message as read

  `DELETE`          `/api/messages/:id`                Soft-delete a message
                                                       (user-side)
  ---------------------------------------------------------------------------------

#### Data Model (`Message` Collection)

``` js
{
  senderId: ObjectId,
  receiverId: ObjectId,
  bookingId: ObjectId,
  spaceId: ObjectId,
  content: String,
  attachments: [String],
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedBy: [ObjectId]
}
```

#### Key Features

-   Real-time typing and delivery status\
-   Message read receipts\
-   Optional file/image attachments\
-   Notification triggers\
-   Admin moderation tools

#### Security

-   Only chat participants can access conversations\
-   JWT auth for socket connections\
-   Input sanitization and abuse detection

------------------------------------------------------------------------

## 6. Database Collections (Updated Summary)

  Collection        Purpose                     Status
  ----------------- --------------------------- ----------
  Users             Authentication & profiles   ✅
  Spaces            Workspace listings          ✅
  Bookings          Reservation data            ✅
  Reviews           Ratings & feedback          ✅
  SearchAnalytics   BI data tracking            ✅
  Wallets           Balances & transactions     🚧
  Reports           Abuse & moderation          🚧
  **Messages**      Real-time chat history      🚧 (New)

------------------------------------------------------------------------

## 7. Standard Response Format

``` json
{
  "success": true,
  "message": "Request successful",
  "data": { ... }
}
```

------------------------------------------------------------------------

## 8. Security & Trust Measures

  Type                         Description                 Status
  ---------------------------- --------------------------- --------
  JWT + role-based access      Authentication guard        ✅
  Input validation             Joi schema per endpoint     ✅
  Rate limits                  API abuse prevention        ✅
  Password hashing             Bcrypt                      ✅
  Booking conflict checks      Prevent overlap             ✅
  Chat encryption              Socket.io + HTTPS secured   🚧
  Message moderation reports   Inappropriate content       🚧

------------------------------------------------------------------------

## 9. Development Phases (Roadmap)

  Phase   Module                               Status   Notes
  ------- ------------------------------------ -------- -------------
  1       Auth & User System                   ✅       Complete
  2       Space Management & Search            ✅       Complete
  3       Booking & Review                     ✅       Complete
  4       Payment, Admin, Reports, Messaging   🚧       In Progress
  5       Notifications & Mobile Integration   🔜       Planned

------------------------------------------------------------------------

## 10. Business Value

-   **Faster Conversions:** In-app chat reduces booking friction.\
-   **Higher Trust:** Escrow payments + direct communication.\
-   **Retention:** Hosts and renters build relationships.\
-   **Scalability:** Socket.io supports thousands of concurrent
    sessions.\
-   **Moderation:** Built-in report system for safe community.

------------------------------------------------------------------------

## 11. Dev Guidelines

-   Use **ES modules** (`import/export`)\
-   Structure code by domain: routes → controllers → services → models\
-   Apply **SOLID**, **DRY**, and **Separation of Concerns**\
-   Validate input early → controller → database\
-   Centralized error and logging via Winston\
-   Use async/await with try/catch\
-   Keep consistent response format
