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
| H1 | Insecure default secret key | :white_circle: Pending | | |
| H2 | Refresh/access token indistinguishable | :white_circle: Pending | | |
| H3 | No password complexity | :white_circle: Pending | | |
| H4 | Public upload no rate limit | :white_circle: Pending | | |
| H5 | Upload delete path traversal | :white_circle: Pending | | |
| H6 | Lazy loading crash in tour_grouping | :white_circle: Pending | | |
| H7 | Alembic missing 5 model imports | :white_circle: Pending | | |
| H8 | Host registration no tokens returned | :white_circle: Pending | | |
| H9 | Hardcoded seed passwords | :white_circle: Pending | | |
| H10 | Admin booking status enum mismatch | :white_circle: Pending | | |

## Phase 3: Medium Priority (target: next sprint)

| ID | Issue | Status | Fixed In | Notes |
|----|-------|--------|----------|-------|
| M1 | Artist detail shows inactive artists | :white_circle: Pending | | |
| M2 | HTML injection in contact email | :white_circle: Pending | | |
| M3 | Email enumeration via registration | :white_circle: Pending | | |
| M4 | UserResponse missing name field | :white_circle: Pending | | |
| M5 | No frontend middleware | :white_circle: Pending | | |
| M6 | Token refresh race condition | :white_circle: Pending | | |
| M7 | Superuser onboarding redirect | :white_circle: Pending | | |
| M8 | Decimal/float type mismatch | :white_circle: Pending | | |
| M9 | tour_grouping community.city crash | :white_circle: Pending | | |
| M10 | Geocoding no rate limit | :white_circle: Pending | | |
| M11 | Duplicate auth checks in dashboard | :white_circle: Pending | | |
| M12 | Hardcoded category counts | :white_circle: Pending | | |

## Phase 4: Low Priority (backlog)

| ID | Issue | Status |
|----|-------|--------|
| L1 | Past dates selectable in booking | :white_circle: Pending |
| L2 | Mobile menu hidden before scroll | :white_circle: Pending |
| L3 | Footer missing privacy link | :white_circle: Pending |
| L4 | Breadcrumb /search vs /talents | :white_circle: Pending |
| L5 | No /register index page | :white_circle: Pending |
| L6 | N+1 favorites API calls | :white_circle: Pending |
| L7 | Swagger docs in production | :white_circle: Pending |
| L8 | PostgreSQL-specific search | :white_circle: Pending |
| L9 | window.location.href redirects | :white_circle: Pending |

---

## Change Log

| Date | Commit | Items Fixed |
|------|--------|-------------|
| 2026-04-16 | security-hardening | C1, C2, C3, C4, C5 — all critical security issues |
