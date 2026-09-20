# CLAUDE.md — LeaveEasy Reference

**LeaveEasy** is the week 6–9 leave-request web app for ADT-RAISE Batch 2 · Module 2. This is a phased build following `leaveeasy-spec.md` section 8 — **always read the spec first before making changes, and never implement future weeks' work without being asked.**

## Tech Constraints (Non-negotiable)

- **Plain HTML / CSS / vanilla JavaScript only** — no frameworks (React, Vue, Angular, Next.js, Tailwind, etc.)
- **One `.html` file per screen** at the project root (`index.html`, `leave-requests.html`, `leave-request-detail.html`, `new-leave-request.html`, `leave-types.html`, `dashboard.html`)
- **No custom server** — pages talk directly to Firestore + Firebase Auth
- **Firestore only** for data persistence; **Firebase Auth** for login; **Firebase Hosting** for deployment
- **No build step, no bundler, no framework** — deployed as-is

## Naming Convention

Most `.js` files deliberately use **Thai identifiers** for variables and functions (eg. `ผู้ขอลา`, `เวลาตอนนี้`, `ฟอร์ม`). When editing existing files, match that style. New utility functions may use English if used only by English-named code.

## Where Things Live

| | Location |
|---|---|
| **Shared styles** | `css/style.css` — reuse existing classes before adding new ones |
| **Shared utilities** | `js/util.js` — contains `esc()`, `ป้ายสถานะ()`, `เวลาตอนนี้()`, `ค่าจากURL()` and other helpers used across pages |
| **Navigation bar** | `js/nav.js` — shared navbar rendered on each page |
| **Firebase config** | `js/firebase-config.js` — initializes Firestore and Auth, exposes `window.db` and `window.auth` |
| **Human setup steps** | `SETUP.md` — append new week-sections at the bottom; never rewrite existing weeks |

## Firestore Field Names (Case-Sensitive)

Field names in Firestore **must match `leaveeasy-spec.md` section 5 exactly**, including casing. A mismatch fails silently. Examples:

- ✅ `status` (not `Status` or `STATUS`)
- ✅ `requesterId` (not `requester_id` or `requesterID`)
- ✅ `approverName` (not `approver_name` or `approverName`)
- ✅ `leaveTypeName` (not `leave_type_name`)
- ✅ `createdAt` (not `created_at`)

Collections in Firestore use **camelCase with no underscores**:
- ✅ `leaveRequests` (not `leave_requests`)
- ✅ `leaveTypes` (not `leave_types`)

## Weekly Scope Rule

Section 8 of the spec defines **what each week builds**. Never implement a later week's features early — the scope is intentional for incremental testing and feedback. If you think something from a future week should happen now, ask the user first.

Example: Week 8 adds role-based Security Rules. Week 7 only adds the minimum rule "must be logged in." Don't write role checks in week 7.

---

Last updated: Week 7 (2026-09-20)
