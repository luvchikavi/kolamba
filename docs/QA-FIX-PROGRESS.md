# QA Fix Progress Tracker -- v1.10

**Started:** 2026-04-16
**Audit doc:** [QA-AUDIT-v1.10.md](QA-AUDIT-v1.10.md)

---

## Phase 1: Critical Security (target: immediate)

| ID | Issue | Status | Fixed In | Notes |
|----|-------|--------|----------|-------|
| C1 | Admin self-registration | :white_check_mark: Fixed | 2026-04-16 | Only `artist` and `community` roles allowed in registration |
| C2 | 22 unauth endpoints | :white_check_mark: Fixed | 2026-04-16 | Added `Depends(get_current_user)` to all write endpoints in bookings, tours, tour dates, communities. Added ownership checks to bookings. |
| C3 | Reset token as access token | :white_check_mark: Fixed | 2026-04-16 | `get_current_user_optional` now rejects tokens with `purpose` claim |
| C4 | Stub endpoints return 200 | :white_check_mark: Fixed | 2026-04-16 | Changed to return 501 Not Implemented |
| C5 | Dead booking page /talents/[id]/book | :white_check_mark: Fixed | 2026-04-16 | Replaced with redirect to `/booking/[id]` |

## Phase 2: High Priority (target: this week)

| ID | Issue | Status | Fixed In | Notes |
|----|-------|--------|----------|-------|
| H1 | Insecure default secret key | :white_check_mark: Fixed | 2026-04-16 | Startup check fails fast if default key used in non-dev env |
| H2 | Refresh/access token indistinguishable | :white_check_mark: Fixed | 2026-04-16 | Refresh tokens now have `purpose: "refresh"` claim; refresh endpoint validates it |
| H3 | No password complexity | :white_check_mark: Fixed | 2026-04-16 | Min 8 chars on registration and password reset |
| H4 | Public upload no rate limit | :white_check_mark: Fixed | 2026-04-16 | Added 5/minute rate limit to public image upload |
| H5 | Upload delete path traversal | :white_check_mark: Fixed | 2026-04-16 | Strict prefix check + `..` path traversal block |
| H6 | Lazy loading crash in tour_grouping | :white_check_mark: Fixed | 2026-04-16 | Added `selectinload(Artist.categories)` to tour query |
| H7 | Alembic missing 5 model imports | :white_check_mark: Fixed | 2026-04-16 | Added ArtistTourDate, Conversation, Message, TourJoinRequest, Notification |
| H8 | Host registration no tokens returned | :white_check_mark: Fixed | 2026-04-16 | Registration now returns access_token + refresh_token for auto-login |
| H9 | Hardcoded seed passwords | :white_check_mark: Fixed | 2026-04-16 | Reads from SEED_SUPERUSER_PASSWORD env var, falls back to random token |
| H10 | Admin booking status enum mismatch | :white_check_mark: Fixed | 2026-04-16 | Aligned with actual model statuses: pending, quote_sent, approved, declined, rejected, completed, cancelled |

## Phase 3: Medium Priority (target: next sprint)

| ID | Issue | Status | Fixed In | Notes |
|----|-------|--------|----------|-------|
| M1 | Artist detail shows inactive artists | :white_check_mark: Fixed | 2026-04-16 | Returns 404 for non-active artists |
| M2 | HTML injection in contact email | :white_check_mark: Fixed | 2026-04-16 | User input escaped with `html.escape()` |
| M3 | Email enumeration via registration | :white_check_mark: Fixed | 2026-04-16 | Generic error message on duplicate email |
| M4 | UserResponse missing name field | :white_check_mark: Fixed | 2026-04-16 | Added `name` and `status` fields |
| M5 | No frontend middleware | :white_check_mark: Fixed | 2026-04-16 | Added `kolamba_auth` cookie on login + middleware for `/dashboard/*` routes |
| M6 | Token refresh race condition | :white_check_mark: Fixed | 2026-04-16 | Delayed nulling of refreshPromise to let concurrent awaits resolve |
| M7 | Superuser onboarding redirect | :white_check_mark: Fixed | 2026-04-16 | Now redirects to `/dashboard/admin` |
| M8 | Decimal/float type mismatch | :white_check_mark: Fixed | 2026-04-16 | Community and ArtistTourDate lat/lng now `Mapped[Optional[Decimal]]` |
| M9 | tour_grouping community.city crash | :white_check_mark: Fixed | 2026-04-16 | Removed fallback to non-existent `community.city` |
| M10 | Geocoding no rate limit | :white_check_mark: Fixed | 2026-04-16 | Added async lock + 1 req/sec throttle for Nominatim API |
| M11 | Duplicate auth checks in dashboard | :no_entry_sign: Kept | | Pages need user data (community_id/artist_id) for queries; not just auth |
| M12 | Hardcoded category counts | :white_check_mark: Fixed | 2026-04-16 | Removed fake counts; shows "Browse artists" instead |

## Phase 4: Low Priority (backlog)

| ID | Issue | Status |
|----|-------|--------|
| L1 | Past dates selectable in booking | :white_check_mark: Fixed | Date picker min set to today |
| L2 | Mobile menu hidden before scroll | :white_check_mark: Fixed | Hamburger button always visible on mobile |
| L3 | Footer missing privacy link | :white_check_mark: Fixed | Added Privacy link |
| L4 | Breadcrumb /search vs /talents | :white_check_mark: Fixed | Links to /talents |
| L5 | No /register index page | :white_check_mark: Fixed | Created role selection page |
| L6 | N+1 favorites API calls | :white_check_mark: Fixed | Fetches all favorites in parallel with `Promise.all` |
| L7 | Swagger docs in production | :white_check_mark: Fixed | Docs/redoc/openapi disabled when `env != "development"` |
| L8 | PostgreSQL-specific search | :white_check_mark: Fixed | SQLite fallback with LIKE-only search when not on PostgreSQL |
| L9 | window.location.href redirects | :white_check_mark: Fixed | Middleware (M5) now prevents unauthenticated dashboard access at edge |

---

## Change Log

| Date | Commit | Items Fixed |
|------|--------|-------------|
| 2026-04-16 | security-hardening | C1, C2, C3, C4, C5 — all critical security issues |
| 2026-04-16 | high-priority-fixes | H1-H10 — all high priority issues |
| 2026-04-16 | medium-low-fixes | M1-M4,M6-M7,M9,M12 + L1-L5 — medium and low fixes |
| 2026-04-16 | remaining-fixes | M5,M8,M10 + L6-L9 — all remaining skipped items |
