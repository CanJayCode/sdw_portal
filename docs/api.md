# CESA-SDW Portal - Frontend API Documentation

> **Version:** 2.1  
> **Base URL:** `http://localhost:5000/api/v1` (replace with production domain in staging/production)  
> **Content-Type:** `application/json`

---

## 📑 Table of Contents
1. [General Architecture & Standards](#1-general-architecture--standards)
2. [Authentication & Session Flow](#2-authentication--session-flow)
3. [Core Status Enums & References](#3-core-status-enums--references)
4. [Authentication Endpoints (`/auth`)](#4-authentication-endpoints-auth)
5. [Clubs Endpoints (`/clubs`)](#5-clubs-endpoints-clubs)
6. [Events Endpoints (`/events` & `/clubs/:clubId/events`)](#6-events-endpoints-events)
7. [Achievements Workflow Endpoints (`/achievements`)](#7-achievements-workflow-endpoints-achievements)
8. [Leaderboard Endpoints (`/leaderboard`)](#8-leaderboard-endpoints-leaderboard)
9. [Semesters Endpoints (`/semesters`)](#9-semesters-endpoints-semesters)
10. [Members Endpoints (`/members` & `/clubs/:clubId/members`)](#10-members-endpoints-members)
11. [Notifications Endpoints (`/notifications` & `/users/me`)](#11-notifications-endpoints-notifications)
12. [Audit Logs Endpoints (`/audit-logs`)](#12-audit-logs-endpoints-audit-logs)
13. [Frontend Integration Recipes](#13-frontend-integration-recipes)

---

## 1. General Architecture & Standards

### Standard Success Response Format
All successful responses share this standardized JSON envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... } // Optional: pagination or additional metadata
}
```

### Standard Pagination Response Format
Endpoints returning paginated lists will include the `meta` object:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data fetched successfully",
  "data": [ ... ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Standard Error Response Format
All error responses (e.g. 400, 401, 403, 404, 409, 422, 500) follow this structure:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 2. Authentication & Session Flow

### Access & Refresh Tokens
- **Access Token:** Short-lived JWT (15 minutes). Send on protected requests via HTTP header:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Refresh Token:** Long-lived JWT (7 days). Store securely (e.g. `localStorage`, secure cookie, or mobile keychain). When an API returns `401 Unauthorized` with `"Access token has expired"`, call `POST /auth/refresh` with `{ "refreshToken": "<token>" }` to obtain a fresh token pair.

---

## 3. Core Status Enums & References

### Clubs
| Code | Name | Scope / Role |
| :--- | :--- | :--- |
| `ACM` | Association for Computing Machinery | **CESA Coordinator** (Institution-wide scope, Achievement review & approvals, Leaderboard) |
| `OWASP` | OWASP Student Chapter | Club Scope |
| `GDGC` | Google Developer Groups on Campus | Club Scope |
| `LFDT` | Linux Foundation Developer's Tribe | Club Scope |
| `ACM-W` | ACM Women in Computing | Club Scope |

### Achievement Workflow Statuses
```
[SUBMITTED]
    ↓
PENDING_DOCUMENTATION_REVIEW (Assigned to ACM Doc Member)
    ├─ APPROVED_BY_DOCUMENTATION ──► PENDING_SECRETARY_APPROVAL
    │                                     ├─ AUTHENTICATED (Points Added to Leaderboard)
    │                                     │     └─ (Override by Secretary) ──► REJECTED_BY_SECRETARY
    │                                     └─ REJECTED_BY_SECRETARY
    ├─ EVIDENCE_REQUESTED ──► (Student resubmits) ──► PENDING_DOCUMENTATION_REVIEW
    └─ REJECTED_BY_DOCUMENTATION (or REJECTED)
```

### Event Statuses
- `DRAFT`: Initial draft by club organizers.
- `PENDING_APPROVAL`: Created by Management Executive, awaiting Club President approval.
- `PUBLISHED`: Approved and publicly open for student registration.
- `DELISTED`: Administrative override by ACM VP (registrations cancelled, students notified).
- `CANCELLED`: Event cancelled.
- `COMPLETED`: Event concluded.

### Event Registration Statuses
- `REGISTERED`: Successfully registered (valid ticket).
- `CANCELLED`: Cancelled by student or due to delist.
- `ATTENDED`: Student checked in at the venue.

---

## 4. Authentication Endpoints (`/auth`)

### 4.1 Register Student
Creates a new student profile. If the student previously submitted any guest achievements using this PRN or email, they are automatically linked to this account.

- **Method:** `POST`
- **URL:** `/api/v1/auth/register`
- **Auth Required:** No
- **Rate Limit:** 10 requests / 15 min

#### Request Body
```json
{
  "prn": "STU-2026-003",
  "email": "student3@institution.edu",
  "name": "Neha Sharma",
  "password": "Password123!",
  "branch": "Computer Engineering",
  "year": "TE" // Options: "FE", "SE", "TE", "BE"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Student registered successfully",
  "data": {
    "user": {
      "id": "66e57b98f1234567890abcd1",
      "prn": "STU-2026-003",
      "email": "student3@institution.edu",
      "name": "Neha Sharma",
      "branch": "Computer Engineering",
      "year": "TE",
      "avatar": ""
    },
    "auth": {
      "isCesaAdmin": false,
      "cesaRoles": [],
      "memberships": []
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### 4.2 Login
Authenticate using PRN or Email and Password. Returns the user object, aggregated RBAC roles and permissions across all clubs, and JWT tokens.

- **Method:** `POST`
- **URL:** `/api/v1/auth/login`
- **Auth Required:** No
- **Rate Limit:** 10 requests / 15 min

#### Request Body
```json
{
  "prnOrEmail": "acm.president@institution.edu", // Or PRN: "ACM-PRES-001"
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66e57b98f1234567890abcd2",
      "prn": "ACM-PRES-001",
      "email": "acm.president@institution.edu",
      "name": "Aarav Sharma",
      "branch": "Computer Engineering",
      "year": "BE",
      "avatar": ""
    },
    "auth": {
      "isCesaAdmin": true,
      "cesaRoles": [
        {
          "roleName": "President",
          "clubCode": "ACM"
        }
      ],
      "memberships": [
        {
          "clubId": "66e57b98f1234567890abc99",
          "clubCode": "ACM",
          "clubName": "Association for Computing Machinery (ACM)",
          "isCoordinator": true,
          "roles": [
            {
              "id": "66e57b98f1234567890abc88",
              "name": "President",
              "scope": "CESA"
            }
          ],
          "permissions": [
            "CREATE_EVENT",
            "EDIT_EVENT",
            "DELETE_EVENT",
            "CREATE_EVENT_CESA",
            "DELETE_EVENT_CESA",
            "EDIT_CLUB_MEMBERS",
            "REMOVE_CLUB_MEMBERS",
            "EDIT_CLUB_MEMBERS_CESA",
            "REMOVE_CLUB_MEMBERS_CESA",
            "VIEW_CLUB_MEMBERS",
            "VIEW_ALL_MEMBERS_CESA",
            "VIEW_LEADERBOARD"
          ]
        }
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### 4.3 Refresh Token
Exchange an existing refresh token for a new token pair.

- **Method:** `POST`
- **URL:** `/api/v1/auth/refresh`
- **Auth Required:** No

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

---

### 4.4 Logout
Revokes the refresh token session.

- **Method:** `POST`
- **URL:** `/api/v1/auth/logout`
- **Auth Required:** No

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 4.5 Get Current User Profile (`/auth/me`)
Returns the logged-in user profile, active club memberships, and union of permissions.

- **Method:** `GET`
- **URL:** `/api/v1/auth/me`
- **Auth Required:** Yes (`Bearer <accessToken>`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "66e57b98f1234567890abcd2",
      "prn": "ACM-PRES-001",
      "email": "acm.president@institution.edu",
      "name": "Aarav Sharma",
      "branch": "Computer Engineering",
      "year": "BE",
      "avatar": "",
      "isActive": true,
      "createdAt": "2026-09-14T07:30:00.000Z"
    },
    "auth": {
      "isCesaAdmin": true,
      "cesaRoles": [
        { "roleName": "President", "clubCode": "ACM" }
      ],
      "memberships": [ ... ]
    }
  }
}
```

---

## 5. Clubs Endpoints (`/clubs`)

### 5.1 Get All Clubs
List all active clubs with coordinator status.

- **Method:** `GET`
- **URL:** `/api/v1/clubs`
- **Auth Required:** No

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Clubs retrieved successfully",
  "data": [
    {
      "_id": "66e57b98f1234567890abc99",
      "code": "ACM",
      "name": "Association for Computing Machinery (ACM)",
      "description": "CESA Coordinator Club...",
      "logoUrl": "https://...",
      "isCoordinator": true,
      "isActive": true
    },
    {
      "_id": "66e57b98f1234567890abc98",
      "code": "OWASP",
      "name": "OWASP Student Chapter",
      "description": "Dedicated to cyber security...",
      "logoUrl": "https://...",
      "isCoordinator": false,
      "isActive": true
    }
  ]
}
```

---

### 5.2 Get Club Details by ID
Returns club profile plus active members count and upcoming events count.

- **Method:** `GET`
- **URL:** `/api/v1/clubs/:clubId`
- **Auth Required:** No

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Club details retrieved successfully",
  "data": {
    "club": {
      "_id": "66e57b98f1234567890abc98",
      "code": "OWASP",
      "name": "OWASP Student Chapter",
      "description": "Dedicated to cyber security...",
      "isCoordinator": false
    },
    "stats": {
      "activeMembersCount": 48,
      "upcomingEventsCount": 3
    }
  }
}
```

---

### 5.3 Get Roles of a Club
Returns all configured roles and their permissions for this club.

- **Method:** `GET`
- **URL:** `/api/v1/clubs/:clubId/roles`
- **Auth Required:** Yes (`Bearer <accessToken>`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Club roles retrieved successfully",
  "data": [
    {
      "_id": "66e57b98f1234567890abd11",
      "clubId": "66e57b98f1234567890abc98",
      "name": "President",
      "scope": "CLUB",
      "permissions": [
        "CREATE_EVENT",
        "EDIT_EVENT",
        "DELETE_EVENT",
        "EDIT_CLUB_MEMBERS",
        "REMOVE_CLUB_MEMBERS",
        "VIEW_CLUB_MEMBERS",
        "VIEW_LEADERBOARD"
      ]
    }
  ]
}
```

---

## 6. Events Endpoints (`/events`)

### 6.1 Browse Published Events Across All Clubs
Returns published events. Supports filtering by club, status, and upcoming flag.

- **Method:** `GET`
- **URL:** `/api/v1/events`
- **Auth Required:** Optional
- **Query Parameters:**
  - `clubId` (optional): Filter by specific club ObjectId.
  - `status` (optional): Default is `PUBLISHED`.
  - `upcoming` (optional): `true` to only show future events.
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Events fetched successfully",
  "data": [
    {
      "_id": "66e57b98f1234567890abf01",
      "title": "OWASP Capture The Flag (CTF) 2026",
      "description": "An intense 24-hour cybersecurity competition...",
      "bannerUrl": "https://...",
      "venue": "Lab 401 & Online",
      "mode": "HYBRID",
      "startDate": "2026-09-21T09:00:00.000Z",
      "endDate": "2026-09-22T09:00:00.000Z",
      "registrationDeadline": "2026-09-20T18:00:00.000Z",
      "capacity": 120,
      "registeredCount": 42,
      "status": "PUBLISHED",
      "clubId": {
        "_id": "66e57b98f1234567890abc98",
        "code": "OWASP",
        "name": "OWASP Student Chapter",
        "logoUrl": "https://..."
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 6.2 Get Single Event Details
Returns event info. If authenticated, also returns the current user's registration and ticket if registered.

- **Method:** `GET`
- **URL:** `/api/v1/events/:eventId`
- **Auth Required:** Optional

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Event retrieved successfully",
  "data": {
    "event": {
      "_id": "66e57b98f1234567890abf01",
      "title": "OWASP Capture The Flag (CTF) 2026",
      "description": "...",
      "capacity": 120,
      "registeredCount": 42,
      "status": "PUBLISHED",
      "clubId": { ... }
    },
    "userRegistration": {
      "ticketCode": "TKT-8F2A-94B1",
      "status": "REGISTERED",
      "checkedIn": false
    }
  }
}
```

---

### 6.3 Create Event for a Club
Created by Management Executive or Club President. Moves to `PENDING_APPROVAL` (or `PUBLISHED` if creator is President).

- **Method:** `POST`
- **URL:** `/api/v1/clubs/:clubId/events`
- **Auth Required:** Yes (`CREATE_EVENT` permission)

#### Request Body
```json
{
  "title": "Introduction to Web Exploitation",
  "description": "Hands-on session covering OWASP Top 10 vulnerabilities.",
  "bannerUrl": "https://example.com/banner.png",
  "venue": "Seminar Hall 2",
  "mode": "OFFLINE", // Options: "OFFLINE", "ONLINE", "HYBRID"
  "startDate": "2026-10-05T14:00:00.000Z",
  "endDate": "2026-10-05T17:00:00.000Z",
  "registrationDeadline": "2026-10-04T23:59:59.000Z",
  "capacity": 80,
  "autoPublish": false
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Event created successfully",
  "data": {
    "_id": "66e57b98f1234567890abf02",
    "clubId": "66e57b98f1234567890abc98",
    "title": "Introduction to Web Exploitation",
    "status": "PENDING_APPROVAL",
    "capacity": 80,
    "registeredCount": 0
  }
}
```

---

### 6.4 Approve Event (Club President)
Approves an event in `PENDING_APPROVAL` status and transitions it to `PUBLISHED`.

- **Method:** `PATCH`
- **URL:** `/api/v1/clubs/:clubId/events/:eventId/approve`
- **Auth Required:** Yes (`EDIT_EVENT` or President role in club)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Event approved and published successfully",
  "data": {
    "_id": "66e57b98f1234567890abf02",
    "status": "PUBLISHED",
    "approvedBy": "66e57b98f1234567890abcd4",
    "approvedAt": "2026-09-14T08:00:00.000Z"
  }
}
```

---

### 6.5 Register for Event
Atomic, concurrency-safe registration. Decrements remaining capacity, creates an event registration record with unique ticket code and QR payload, and dispatches a notification.

- **Method:** `POST`
- **URL:** `/api/v1/events/:eventId/register`
- **Auth Required:** Yes (Authenticated student)

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registered for event successfully",
  "data": {
    "registration": {
      "_id": "66e57b98f1234567890ac111",
      "eventId": "66e57b98f1234567890abf01",
      "userId": "66e57b98f1234567890abcd7",
      "ticketCode": "TKT-3C7D-891E",
      "status": "REGISTERED",
      "checkedIn": false,
      "registeredAt": "2026-09-14T08:15:00.000Z"
    },
    "ticketCode": "TKT-3C7D-891E",
    "qrData": "{\"ticket\":\"TKT-3C7D-891E\",\"evt\":\"...\",\"usr\":\"...\",\"ts\":1726301700000}"
  }
}
```

---

### 6.6 Cancel Registration
Cancels the student's registration and frees up event capacity.

- **Method:** `DELETE`
- **URL:** `/api/v1/events/:eventId/register`
- **Auth Required:** Yes

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Registration cancelled successfully",
  "data": {
    "message": "Registration cancelled successfully"
  }
}
```

---

### 6.7 Organizer Check-In (Attendee Verification)
Used by organizers at the event entrance to check in attendees via QR ticket code or PRN.

- **Method:** `POST`
- **URL:** `/api/v1/events/:eventId/check-in`
- **Auth Required:** Yes (Organizer)

#### Request Body
```json
{
  "ticketCode": "TKT-3C7D-891E" // Or "prn": "STU-2026-001"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student checked in successfully",
  "data": {
    "_id": "66e57b98f1234567890ac111",
    "ticketCode": "TKT-3C7D-891E",
    "checkedIn": true,
    "checkedInAt": "2026-09-21T09:12:00.000Z",
    "status": "ATTENDED",
    "userId": {
      "name": "Aditya Kulkarni",
      "prn": "STU-2026-001"
    }
  }
}
```

---

### 6.8 Delist Event (ACM VP / CESA Scope Override)
ACM Vice President administrative override to delist an event. Active registrations are cancelled, students are notified, and an audit entry is created.

- **Method:** `POST`
- **URL:** `/api/v1/clubs/:clubId/events/:eventId/delist`
- **Auth Required:** Yes (`DELETE_EVENT_CESA` permission)

#### Request Body
```json
{
  "reason": "Date conflict with University examinations schedule."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Event delisted successfully",
  "data": {
    "_id": "66e57b98f1234567890abf01",
    "status": "DELISTED",
    "delistReason": "Date conflict with University examinations schedule.",
    "delistedAt": "2026-09-14T08:20:00.000Z"
  }
}
```

---

### 6.9 Un-delist Event (ACM VP)
Restores a previously delisted event back to `PUBLISHED`.

- **Method:** `POST`
- **URL:** `/api/v1/clubs/:clubId/events/:eventId/undelist`
- **Auth Required:** Yes (`DELETE_EVENT_CESA` permission)

---

## 7. Achievements Workflow Endpoints (`/achievements`)

### 7.1 Get Achievement Types & Default Points
Returns configured categories (Hackathon, Research Paper, Workshop Speaker, etc.) with default point values.

- **Method:** `GET`
- **URL:** `/api/v1/achievements/types`
- **Auth Required:** No

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Achievement types retrieved successfully",
  "data": [
    {
      "_id": "66e57b98f1234567890abd01",
      "code": "HACKATHON_WIN",
      "name": "Hackathon Winner / Runner Up",
      "category": "Competition",
      "defaultPoints": 100,
      "description": "National/International level hackathon win..."
    },
    {
      "_id": "66e57b98f1234567890abd02",
      "code": "PAPER_PUB",
      "name": "Research Paper Publication",
      "category": "Academics",
      "defaultPoints": 80,
      "description": "Published in IEEE, Springer, or Scopus..."
    }
  ]
}
```

---

### 7.2 Submit Achievement (Authenticated Student)
Submits an achievement for verification. **System automatically assigns round-robin to an ACM Documentation Member** and sets status to `PENDING_DOCUMENTATION_REVIEW`.

- **Method:** `POST`
- **URL:** `/api/v1/achievements`
- **Auth Required:** Yes (`Bearer <accessToken>`)

#### Request Body
```json
{
  "title": "1st Prize at National AI Hackathon 2026",
  "description": "Built an autonomous medical diagnostic assistance tool.",
  "achievementTypeId": "66e57b98f1234567890abd01",
  "evidenceUrls": [
    "https://storage.institution.edu/certificates/cert-ai-2026.pdf"
  ],
  "semesterId": "66e57b98f1234567890abc01" // Optional, defaults to current active semester
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Achievement submitted successfully and queued for documentation review",
  "data": {
    "_id": "66e57b98f1234567890ac301",
    "submitterType": "STUDENT",
    "studentId": "66e57b98f1234567890abcd7",
    "title": "1st Prize at National AI Hackathon 2026",
    "points": 100,
    "status": "PENDING_DOCUMENTATION_REVIEW",
    "assignedDocReviewerId": "66e57b98f1234567890abcd5",
    "evidenceUrls": [
      "https://storage.institution.edu/certificates/cert-ai-2026.pdf"
    ]
  }
}
```

---

### 7.3 Submit Achievement as Guest
Allows non-logged-in students or guests to submit achievements using email and PRN. Automatically claimed when they register or log in.

- **Method:** `POST`
- **URL:** `/api/v1/achievements/guest`
- **Auth Required:** No

#### Request Body
```json
{
  "name": "Sameer Joshi",
  "email": "sameer.joshi@institution.edu",
  "prn": "STU-2026-099",
  "title": "Speaker at Cloud Community Day 2026",
  "description": "Delivered a session on Kubernetes Container Security.",
  "achievementTypeId": "66e57b98f1234567890abd03",
  "evidenceUrls": [
    "https://example.com/speaker-certificate.pdf"
  ]
}
```

---

### 7.4 Get My Submitted Achievements
Returns all achievements submitted by the currently logged-in student.

- **Method:** `GET`
- **URL:** `/api/v1/achievements/my`
- **Auth Required:** Yes
- **Query Parameters:**
  - `status` (optional): Filter by status
  - `page` (optional)
  - `limit` (optional)

---

### 7.5 Review Queue (ACM Doc Member / Secretary)
List pending achievements for reviewers.

- **Method:** `GET`
- **URL:** `/api/v1/achievements`
- **Auth Required:** Yes (`REVIEW_ACHIEVEMENT_EVIDENCE` or `APPROVE_ACHIEVEMENT`)
- **Query Parameters:**
  - `status` (optional, e.g. `PENDING_DOCUMENTATION_REVIEW` or `PENDING_SECRETARY_APPROVAL`)
  - `assignedToMe` (optional: `true` to filter round-robin assignments for current Doc Member)
  - `semesterId` (optional)
  - `page` / `limit`

---

### 7.6 Step 3: Documentation Review (ACM Doc Member Only)
Doc Member reviews evidence URLs and updates status.
- `action = "APPROVE"` ➔ Status becomes `PENDING_SECRETARY_APPROVAL`.
- `action = "REQUEST_EVIDENCE"` ➔ Status becomes `EVIDENCE_REQUESTED`.
- `action = "REJECT"` ➔ Status becomes `REJECTED_BY_DOCUMENTATION`.

- **Method:** `PATCH`
- **URL:** `/api/v1/achievements/:id/review`
- **Auth Required:** Yes (`REVIEW_ACHIEVEMENT_EVIDENCE` permission)

#### Request Body
```json
{
  "action": "APPROVE", // Options: "APPROVE", "REJECT", "REQUEST_EVIDENCE"
  "notes": "Verified certificate signature against official competition portal."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Achievement documentation reviewed: APPROVE",
  "data": {
    "_id": "66e57b98f1234567890ac301",
    "status": "PENDING_SECRETARY_APPROVAL",
    "reviewHistory": [
      {
        "reviewerId": "66e57b98f1234567890abcd5",
        "action": "PENDING_SECRETARY_APPROVAL",
        "notes": "Verified certificate signature against official competition portal.",
        "reviewedAt": "2026-09-14T08:30:00.000Z"
      }
    ]
  }
}
```

---

### 7.7 Step 3b: Student Resubmits Evidence
When an achievement is in `EVIDENCE_REQUESTED` status, the student can submit new evidence. Resets status to `PENDING_DOCUMENTATION_REVIEW`.

- **Method:** `PATCH`
- **URL:** `/api/v1/achievements/:id/evidence`
- **Auth Required:** Yes (Submitter)

#### Request Body
```json
{
  "evidenceUrls": [
    "https://storage.institution.edu/certificates/cert-verified-stamp.pdf"
  ],
  "notes": "Attached official signed letter from event coordinator."
}
```

---

### 7.8 Step 4: Secretary / Co-Secretary Approval
Final authentication. Status becomes `AUTHENTICATED`. **Points are automatically awarded to the student on the CESA Leaderboard** for the current semester.

- **Method:** `POST`
- **URL:** `/api/v1/achievements/:id/approve`
- **Auth Required:** Yes (`APPROVE_ACHIEVEMENT` permission)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Achievement approved and points credited to CESA leaderboard",
  "data": {
    "_id": "66e57b98f1234567890ac301",
    "status": "AUTHENTICATED",
    "points": 100,
    "approvalInfo": {
      "approvedBy": "66e57b98f1234567890abcd3",
      "approvedAt": "2026-09-14T08:45:00.000Z",
      "approverRole": "Secretary",
      "coSecretaryApproved": false,
      "secretaryOverridden": false
    }
  }
}
```

---

### 7.9 Step 4b: Secretary / Co-Secretary Rejection
Rejects the achievement. Status becomes `REJECTED_BY_SECRETARY`.

- **Method:** `POST`
- **URL:** `/api/v1/achievements/:id/reject`
- **Auth Required:** Yes (`APPROVE_ACHIEVEMENT` permission)

#### Request Body
```json
{
  "reason": "Duplicate submission or does not meet eligibility criteria."
}
```

---

### 7.10 Step 4c: Secretary Override (ACM Secretary Only)
If an achievement was approved by the Co-Secretary, the ACM Secretary can override it. Reverses points from the CESA Leaderboard and logs an audit trail.

- **Method:** `POST`
- **URL:** `/api/v1/achievements/:id/override`
- **Auth Required:** Yes (`OVERRIDE_ACHIEVEMENT_APPROVAL` permission)

#### Request Body
```json
{
  "reason": "Event was organized within student's own family trust; violates institutional impartiality guidelines."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Secretary override applied and points reversed",
  "data": {
    "_id": "66e57b98f1234567890ac301",
    "status": "REJECTED_BY_SECRETARY",
    "approvalInfo": {
      "secretaryOverridden": true,
      "overrideReason": "Event was organized within student's own family trust...",
      "overriddenAt": "2026-09-14T09:00:00.000Z"
    }
  }
}
```

---

## 8. Leaderboard Endpoints (`/leaderboard`)

### 8.1 Public CESA Leaderboard (Top 100)
Public endpoint showing institution-wide rankings for the current active semester (or selected semester). Ranked strictly by total points.

- **Method:** `GET`
- **URL:** `/api/v1/leaderboard`
- **Auth Required:** **NO (Public)**
- **Query Parameters:**
  - `semesterId` (optional, defaults to current active semester)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 100, max: 100)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "CESA leaderboard fetched successfully",
  "data": [
    {
      "rank": 1,
      "user": {
        "_id": "66e57b98f1234567890abcd7",
        "name": "Aditya Kulkarni",
        "prn": "STU-2026-001",
        "branch": "Computer Engineering",
        "year": "TE",
        "avatar": ""
      },
      "totalPoints": 100,
      "achievementCount": 1,
      "lastUpdated": "2026-09-14T07:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "semester": {
      "id": "66e57b98f1234567890abc01",
      "code": "2026-FALL",
      "name": "Fall Semester 2026",
      "isCurrent": true
    }
  }
}
```

---

### 8.2 Get Individual User Leaderboard Profile
Returns a student's public ranking, total points, and list of authenticated achievements.

- **Method:** `GET`
- **URL:** `/api/v1/leaderboard/users/:userId`
- **Auth Required:** No (Public)
- **Query Parameters:**
  - `semesterId` (optional)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User leaderboard profile retrieved successfully",
  "data": {
    "user": {
      "name": "Aditya Kulkarni",
      "prn": "STU-2026-001",
      "branch": "Computer Engineering",
      "year": "TE"
    },
    "totalPoints": 100,
    "achievementCount": 1,
    "rank": 1,
    "achievements": [
      {
        "_id": "66e57b98f1234567890ac301",
        "title": "Smart India Hackathon 2026 1st Prize Winner",
        "points": 100,
        "status": "AUTHENTICATED",
        "achievementTypeId": {
          "code": "HACKATHON_WIN",
          "name": "Hackathon Winner / Runner Up"
        }
      }
    ]
  }
}
```

---

### 8.3 Get Past Semesters History
Returns historical semesters with podium winners.

- **Method:** `GET`
- **URL:** `/api/v1/leaderboard/history`
- **Auth Required:** No

---

## 9. Semesters Endpoints (`/semesters`)

### 9.1 Get Current Active Semester
Returns information on the current active semester.

- **Method:** `GET`
- **URL:** `/api/v1/semesters/current`
- **Auth Required:** No

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current active semester retrieved successfully",
  "data": {
    "_id": "66e57b98f1234567890abc01",
    "code": "2026-FALL",
    "name": "Fall Semester 2026",
    "startDate": "2026-08-01T00:00:00.000Z",
    "endDate": "2026-12-31T23:59:59.000Z",
    "isCurrent": true
  }
}
```

---

## 10. Members Endpoints (`/members`)

### 10.1 Search Club Members (Visibility-Enforced)
Searches members adhering to governance visibility:
- **Regular students:** Can only search inside clubs they are members of.
- **Club Presidents:** Can search their own club.
- **ACM President / VP (CESA Scope):** Can search across all clubs.

- **Method:** `GET`
- **URL:** `/api/v1/members/search`
- **Auth Required:** Yes
- **Query Parameters:**
  - `name` (optional): Search by student name, PRN, or email.
  - `clubId` (optional): Filter to a specific club.
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)

---

### 10.2 Add Member to Club
Adds a student to a club and assigns roles.

- **Method:** `POST`
- **URL:** `/api/v1/clubs/:clubId/members`
- **Auth Required:** Yes (`EDIT_CLUB_MEMBERS` permission)

#### Request Body
```json
{
  "userId": "66e57b98f1234567890abcd7",
  "roleIds": ["66e57b98f1234567890abd12"] // Optional array of ClubRole IDs
}
```

---

### 10.3 Modify Member Roles
Updates the assigned roles for a club member (multiple roles yield a UNION of permissions).

- **Method:** `PATCH`
- **URL:** `/api/v1/clubs/:clubId/members/:userId`
- **Auth Required:** Yes (`EDIT_CLUB_MEMBERS` permission)

#### Request Body
```json
{
  "roleIds": ["66e57b98f1234567890abd11", "66e57b98f1234567890abd12"]
}
```

---

### 10.4 Remove Member from Club
Removes a member from a club.
- **Cascading Side Effects:**
  - Cancels any upcoming event registrations for this club's events.
  - Preserves past attendance history.
  - Preserves authenticated achievements and semester points.

- **Method:** `DELETE`
- **URL:** `/api/v1/clubs/:clubId/members/:userId`
- **Auth Required:** Yes (`REMOVE_CLUB_MEMBERS` permission)

#### Request Body
```json
{
  "reason": "Graduated / Tenure Completed"
}
```

---

### 10.5 Self-Leave Club (Student)
Allows a student to leave their own club voluntarily with the same cascading cleanup.

- **Method:** `DELETE`
- **URL:** `/api/v1/users/me/clubs/:clubId`
- **Auth Required:** Yes

---

## 11. Notifications Endpoints (`/notifications`)

### 11.1 List Notifications
Returns user notifications with an unread count.

- **Method:** `GET`
- **URL:** `/api/v1/notifications`
- **Auth Required:** Yes
- **Query Parameters:**
  - `unreadOnly` (optional: `true` / `false`)
  - `page` / `limit`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "_id": "66e57b98f1234567890ad001",
      "type": "ACHIEVEMENT_APPROVED",
      "title": "Achievement Authenticated & Approved! 🎉",
      "message": "Your achievement was authenticated! +100 points awarded.",
      "data": { "achievementId": "66e57b98f1234567890ac301" },
      "isRead": false,
      "createdAt": "2026-09-14T08:45:00.000Z"
    }
  ],
  "meta": {
    "unreadCount": 1,
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### 11.2 Mark Notification as Read
- **Method:** `PATCH`
- **URL:** `/api/v1/notifications/:id/read`
- **Auth Required:** Yes

---

### 11.3 Mark All Notifications as Read
- **Method:** `PATCH`
- **URL:** `/api/v1/notifications/read-all`
- **Auth Required:** Yes

---

### 11.4 Get / Update Notification Preferences
Get or update preferred channel (`IN_APP`, `EMAIL`, `NONE`) per notification type.

- **Get:** `GET /api/v1/users/me/notification-preferences`
- **Update:** `PATCH /api/v1/users/me/notification-preferences`

#### Request Body
```json
{
  "preferences": {
    "EVENT_REGISTERED": "IN_APP",
    "ACHIEVEMENT_APPROVED": "IN_APP",
    "EVENT_DELIST_NOTIFICATION": "IN_APP"
  }
}
```

---

## 12. Audit Logs Endpoints (`/audit-logs`)

### 12.1 Query Privileged Audit Logs (CESA Admins Only)
Audit trail of all administrative actions (event delists, secretary overrides, role updates, member removals).

- **Method:** `GET`
- **URL:** `/api/v1/audit-logs`
- **Auth Required:** Yes (`EDIT_CLUB_MEMBERS_CESA` or CESA scope)
- **Query Parameters:**
  - `action` (optional, e.g. `DELIST_EVENT`, `OVERRIDE_ACHIEVEMENT_APPROVAL`)
  - `targetResource` (optional)
  - `clubId` (optional)
  - `page` / `limit`

---

## 13. Frontend Integration Recipes

### Recipe 1: Axios / Fetch Interceptor for Automatic Token Refresh
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:5000/api/v1/auth/refresh', {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // Refresh token expired or revoked, send user to login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### Recipe 2: Role & Scope Verification in Frontend Components
When a user logs in, the `auth` object returned contains `isCesaAdmin`, `cesaRoles`, and each club membership with permissions:

```typescript
// Check if user is ACM CESA Admin
export const isCesaAdmin = (auth) => auth?.isCesaAdmin === true;

// Check if user has permission in a specific club
export const canPerformInClub = (auth, clubId, permission) => {
  if (auth?.isCesaAdmin) return true; // CESA scope covers all clubs
  const clubMembership = auth?.memberships?.find((m) => m.clubId === clubId);
  return clubMembership?.permissions?.includes(permission) || false;
};

// Check if user is an ACM Documentation Member
export const isDocMember = (auth) => {
  const acm = auth?.memberships?.find((m) => m.clubCode === 'ACM');
  return acm?.roles?.some((r) => r.name === 'Documentation Member');
};

// Check if user is Secretary or Co-Secretary
export const isSecretary = (auth) => {
  const acm = auth?.memberships?.find((m) => m.clubCode === 'ACM');
  return acm?.roles?.some(
    (r) => r.name === 'Secretary' || r.name === 'Co-Secretary'
  );
};
```
