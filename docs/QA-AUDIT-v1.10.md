# QA Audit Report -- Kolamba v1.10

**Date:** 2026-04-16
**Auditor:** Claude Code (automated full-codebase review)
**Scope:** All backend endpoints, frontend pages, data models, auth flows, security

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 5     | Pending |
| HIGH     | 10    | Pending |
| MEDIUM   | 12    | Pending |
| LOW      | 9     | Pending |

---

## CRITICAL

### C1. Anyone can register as admin
- **File:** `backend/app/routers/auth.py:132`
- **Endpoint:** `POST /api/auth/register`
- **Issue:** The `role` field accepts `"admin"` and `"agent"` with no restriction. Any anonymous user can self-register with admin role.
- **Impact:** Privilege escalation. Admin role may grant access to admin dashboard features.
- **Fix:** Whitelist allowed roles to `["artist", "community"]` in registration.

### C2. 22 endpoints have NO authentication
- **Files:** `bookings.py`, `tours.py`, `artist_tour_dates.py`, `communities.py`
- **Issue:** All write/read operations on bookings, tours, tour stops, tour dates, and community update/delete are fully public. No `Depends(get_current_user)`.
- **Affected endpoints:**

| Router | Endpoint | Method | Line |
|--------|----------|--------|------|
| bookings | `/api/bookings` | GET | 244 |
| bookings | `/api/bookings/{id}` | GET | 270 |
| bookings | `/api/bookings/{id}` | PUT | 284 |
| bookings | `/api/bookings/{id}` | DELETE | 310 |
| tours | `/api/tours` | POST | 485 |
| tours | `/api/tours` | GET | 553 |
| tours | `/api/tours/{id}` | GET | 577 |
| tours | `/api/tours/{id}` | PUT | 588 |
| tours | `/api/tours/{id}` | DELETE | 815 |
| tours | `/api/tours/{id}/stops` | POST | 616 |
| tours | `/api/tours/{id}/stops/{id}` | PUT | 673 |
| tours | `/api/tours/{id}/stops/{id}` | DELETE | 698 |
| tours | `/api/tours/{id}/bookings/{id}` | POST | 720 |
| tours | `/api/tours/{id}/bookings/{id}` | DELETE | 777 |
| tours | `/api/tours/{id}/join-request` | POST | 306 |
| tours | `/api/tours/{id}/join-requests` | GET | 379 |
| tours | `/api/tours/{id}/join-requests/{id}` | PUT | 416 |
| tours | `/api/tours/suggestions` | GET | 240 |
| artist_tour_dates | `/api/talents/{id}/tour-dates` | POST | 264 |
| artist_tour_dates | `/api/talents/{id}/tour-dates/{id}` | PUT | 325 |
| artist_tour_dates | `/api/talents/{id}/tour-dates/{id}` | DELETE | 362 |
| communities | `/api/hosts/{id}` | PUT | 706 |
| communities | `/api/hosts/{id}` | DELETE | 746 |

- **Impact:** Anyone on the internet can read, create, modify, and delete all bookings, tours, and communities.
- **Fix:** Add `current_user: User = Depends(get_current_user)` to all write endpoints. Add ownership checks. Keep public read endpoints for tours/tour opportunities but protect write ops.

### C3. Password reset token works as login token
- **File:** `backend/app/routers/auth.py:448`
- **Issue:** Reset tokens are created with `create_access_token()` and only add a `purpose: "reset"` claim. `get_current_user` doesn't check this claim, so a reset token grants full API access for 1 hour.
- **Impact:** Anyone who intercepts a password reset email gets full account access.
- **Fix:** Check `purpose` claim in `get_current_user` and reject tokens with `purpose != None`.

### C4. Stub endpoints return success but discard data
- **File:** `backend/app/routers/artists.py:208-217`
- **Endpoints:** `POST /api/talents`, `PUT /api/talents/{id}`
- **Issue:** Return 200 with "to be implemented" message. Clients think the operation succeeded.
- **Fix:** Return 501 Not Implemented, or remove the endpoints.

### C5. Duplicate booking page with no auth
- **File:** `frontend/src/app/talents/[id]/book/page.tsx`
- **Issue:** Sends `POST /bookings` without Authorization header. All links point to `/booking/[artistId]` instead, making this dead code that's still accessible.
- **Fix:** Delete the file or redirect to `/booking/[artistId]`.

---

## HIGH

### H1. Insecure default secret key
- **File:** `backend/app/config.py:15`
- **Issue:** Default `secret_key = "your-secret-key-change-in-production"`. If env var not set, JWTs are forgeable.
- **Fix:** Remove default or add startup check that fails if default is detected in production.

### H2. Refresh token indistinguishable from access token
- **File:** `backend/app/utils/security.py:41`
- **Issue:** No `type` claim differentiates access vs refresh tokens.
- **Fix:** Add `type: "refresh"` claim; reject in `get_current_user`.

### H3. No password complexity requirements
- **File:** `backend/app/routers/auth.py:39`
- **Issue:** Registration and password reset accept any string.
- **Fix:** Add `min_length=8` and complexity validation.

### H4. Public image upload with no rate limiting
- **File:** `backend/app/routers/uploads.py:243`
- **Endpoint:** `POST /api/uploads/public/image`
- **Fix:** Add rate limiting decorator.

### H5. Upload delete path traversal
- **File:** `backend/app/routers/uploads.py:218`
- **Issue:** Ownership check `if f"kolamba/artists/{current_user.id}" not in public_id` can be bypassed with crafted paths.
- **Fix:** Use strict prefix matching, not `in`.

### H6. Lazy loading crash in async context
- **File:** `backend/app/services/tour_grouping.py:549`
- **Issue:** `artist.categories` accessed without `selectinload` -- raises `MissingGreenlet` in async SQLAlchemy.
- **Fix:** Add `.selectinload(Tour.artist).selectinload(Artist.categories)` to query at line 514.

### H7. 5 models missing from Alembic imports
- **File:** `backend/alembic/env.py:14`
- **Missing:** `ArtistTourDate`, `Conversation`, `Message`, `Notification`, `TourJoinRequest`
- **Fix:** Add imports.

### H8. Host registration doesn't return tokens
- **File:** `backend/app/routers/communities.py:638`
- **Issue:** Creates user but doesn't return JWT. User must manually log in.
- **Fix:** Return access + refresh tokens in response (like auth register does).

### H9. Hardcoded seed passwords in source
- **Files:** `backend/app/routers/admin.py:789`, `backend/app/routers/artists.py:242`
- **Fix:** Use env vars or generated passwords for seed data.

### H10. Admin booking status enum mismatch
- **File:** `backend/app/routers/admin.py:878`
- **Issue:** Allows `"confirmed"` (invalid) but not `"approved"`, `"quote_sent"`, `"completed"`.
- **Fix:** Align with booking model's actual status values.

---

## MEDIUM

### M1. Artist detail shows inactive/pending artists
- **File:** `backend/app/routers/artists.py:192`
- **Fix:** Add `status == "active"` filter (or allow admin bypass).

### M2. HTML injection in contact form email
- **File:** `backend/app/main.py:138`
- **Fix:** Escape HTML in user input before embedding in email.

### M3. Email enumeration via registration
- **File:** `backend/app/routers/auth.py:143`
- **Fix:** Return generic "Check your email" message.

### M4. UserResponse schema missing name field
- **File:** `backend/app/schemas/user.py:25`
- **Fix:** Add `name` and `status` to `UserResponse`.

### M5. No frontend middleware for route protection
- **Fix:** Add `middleware.ts` with cookie-based auth check for `/dashboard/*` routes.

### M6. Token refresh race condition
- **File:** `frontend/src/lib/api.ts:91`
- **Fix:** Don't null out `refreshPromise` until all consumers have resolved.

### M7. Superuser redirected to host dashboard in onboarding
- **File:** `frontend/src/app/onboarding/page.tsx:43`
- **Fix:** Check `is_superuser` and redirect to `/dashboard/admin`.

### M8. Decimal/float type mismatch on lat/lng
- **File:** `backend/app/models/community.py:76`
- **Fix:** Change type annotation to `Mapped[Optional[Decimal]]`.

### M9. tour_grouping fallback references non-existent `community.city`
- **File:** `backend/app/services/tour_grouping.py:395`
- **Fix:** Remove the fallback or use `community.location`.

### M10. Geocoding has no rate limiting for Nominatim
- **File:** `backend/app/services/geocoding.py`
- **Fix:** Add 1 req/sec throttle.

### M11. Duplicate auth checks in dashboard
- **Fix:** Remove auth check from individual dashboard pages; rely on layout.

### M12. Categories page has hardcoded artist counts
- **File:** `frontend/src/app/categories/page.tsx:18`
- **Fix:** Fetch actual counts from API.

---

## LOW

### L1. No min date on booking form (users can select past dates)
### L2. Mobile menu only visible after scrolling
### L3. Footer missing privacy policy link
### L4. Breadcrumb links to /search instead of /talents
### L5. No /register index page (404)
### L6. Host dashboard favorites make N+1 API calls
### L7. Swagger docs exposed in production
### L8. Search uses PostgreSQL-specific functions (untestable with SQLite)
### L9. window.location.href used for redirects instead of router.push
