# Kolamba - Fix-to-Deliver Plan

**Document:** FIX-TO-DELIVER-001
**Created:** 2026-02-15
**Author:** Drishti Consulting
**Purpose:** Comprehensive fix & improvement plan to bring Kolamba to production-ready client delivery
**Tracking:** Each task has a checkbox. Mark `[x]` when complete. Commit after each section.

---

## Status Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Blocked

---

## Priority Levels

| Priority | Meaning | Timeline |
|----------|---------|----------|
| P0 | **Critical** - App broken or security risk | Immediate |
| P1 | **High** - Major bugs, data integrity | Within 1-2 days |
| P2 | **Medium** - Important improvements | Within 3-5 days |
| P3 | **Low** - Polish, nice-to-have | Before final delivery |

---

## Table of Contents

1. [Section A: Security Fixes (P0)](#section-a-security-fixes-p0)
2. [Section B: Backend Critical Fixes (P0-P1)](#section-b-backend-critical-fixes-p0-p1)
3. [Section C: Frontend Critical Fixes (P0-P1)](#section-c-frontend-critical-fixes-p0-p1)
4. [Section D: Database & Data Integrity (P1)](#section-d-database--data-integrity-p1)
5. [Section E: Authentication & Google OAuth (P1)](#section-e-authentication--google-oauth-p1)
6. [Section F: Deployment & Infrastructure (P1-P2)](#section-f-deployment--infrastructure-p1-p2)
7. [Section G: Backend Improvements (P2)](#section-g-backend-improvements-p2)
8. [Section H: Frontend Improvements (P2)](#section-h-frontend-improvements-p2)
9. [Section I: Testing & QA (P2)](#section-i-testing--qa-p2)
10. [Section J: Git & Repo Hygiene (P2)](#section-j-git--repo-hygiene-p2)
11. [Section K: Documentation & Handoff (P3)](#section-k-documentation--handoff-p3)
12. [Section L: Polish & UX (P3)](#section-l-polish--ux-p3)
13. [Section M: v1.4 - New Features (Post-Fix)](#section-m-v14---new-features-post-fix)

---

## Section A: Security Fixes (P0)

> These must be fixed BEFORE any production traffic.

### A1. Rotate & Remove Exposed Secrets
- [ ] **A1.1** Rotate `SECRET_KEY` in Railway backend env vars (generate new 64-char key) *(manual - Railway dashboard)*
- [ ] **A1.2** Rotate `GOOGLE_CLIENT_SECRET` in Google Cloud Console *(manual)*
- [ ] **A1.3** Rotate `CLOUDINARY_API_SECRET` in Cloudinary dashboard *(manual)*
- [ ] **A1.4** Rotate Railway PostgreSQL password *(manual)*
- [x] **A1.5** Remove hardcoded secrets from `backend/.env` (keep `.env.example` only) ✅ 2026-02-15
- [x] **A1.6** Remove credentials from `.claude/settings.local.json` (JWT tokens, DB passwords) ✅ 2026-02-15
- [x] **A1.7** Verify `.gitignore` covers: `.env`, `.env.local`, `.env.*.local`, `*.pem` ✅ 2026-02-15
- [ ] **A1.8** Consider using `git filter-branch` or BFG Repo-Cleaner to scrub secrets from git history *(deferred - secrets were in settings.local.json only, now cleaned)*

### A2. Remove Production Seed/Debug Endpoints
- [x] **A2.1** Gate `POST /api/artists/seed` behind `ENV=development` + `is_superuser` ✅ 2026-02-15
- [x] **A2.2** Gate `POST /api/artists/seed-tour-dates` behind `ENV=development` + `is_superuser` ✅ 2026-02-15
- [x] **A2.3** Gate `POST /api/tours/admin/create-test-tour` behind `ENV=development` + `is_superuser` ✅ 2026-02-15
- [x] **A2.4** Gate `POST /api/admin/seed-superusers` behind `ENV=development` + `is_superuser` ✅ 2026-02-15
- [x] **A2.5** Replace `admin_secret` query param with proper `is_superuser` RBAC ✅ 2026-02-15 (also fixed `/api/auth/admin/reset-password`)

### A3. Fix Authentication Security
- [x] **A3.1** Remove unauthenticated booking fallback (`community_id=1` hardcode) ✅ 2026-02-15
- [x] **A3.2** Require authentication for booking creation ✅ 2026-02-15
- [ ] **A3.3** Implement JWT token blacklist/revocation on logout (Redis or DB table) *(deferred to Section G)*
- [ ] **A3.4** Add rate limiting middleware on auth endpoints *(deferred to Section G)*

**Files:**
- `backend/app/routers/bookings.py`
- `backend/app/routers/artists.py`
- `backend/app/routers/tours.py`
- `backend/app/routers/admin.py`
- `backend/.env` / `.env.example`
- `.claude/settings.local.json`

---

## Section B: Backend Critical Fixes (P0-P1)

### B1. Fix Google OAuth Implementation (P0)
- [x] **B1.1** Replace `tokeninfo` endpoint with `google-auth` library's `verify_oauth2_token()` ✅ 2026-02-15
- [x] **B1.2** Add `google-auth==2.27.0` to `requirements.txt` ✅ 2026-02-15
- [x] **B1.3** Validate ID token using `google.oauth2.id_token.verify_oauth2_token()` ✅ 2026-02-15
- [ ] **B1.4** Test Google OAuth flow end-to-end (register + login) *(manual testing required)*

### B2. Fix Agent-Artist Relationship (P1)
- [x] **B2.1** Add `agent` relationship to Artist model ✅ 2026-02-15
- [ ] **B2.2** Fix agent registration to return temporary password or send setup email *(deferred to Section G - email)*
- [ ] **B2.3** Test agent → artist management flow *(manual testing required)*

### B3. Fix Transaction Management (P1)
- [x] **B3.1** Verified: SQLAlchemy async session context manager handles rollback on exceptions ✅ 2026-02-15
- [x] **B3.2** Verified: `flush()` + `commit()` pattern is already safe — no commit until end ✅ 2026-02-15
- [x] **B3.3** No additional try/except needed — `get_db()` uses `async with` which auto-rolls-back ✅ 2026-02-15

### B4. Fix Input Validation (P1)
- [x] **B4.1** Add validator: `requested_date` must be in the future (BookingCreate) ✅ 2026-02-15
- [x] **B4.2** Add validator: `end_date >= start_date` (TourBase) ✅ 2026-02-15
- [x] **B4.3** Add validator: `end_date >= start_date` (ArtistTourDateBase) ✅ 2026-02-15
- [x] **B4.4** Verified: `venue_info` endpoint already uses `VenueInfoSchema` for validation ✅ 2026-02-15
- [x] **B4.5** Add max_length on notes (2000), description (5000/1000) fields ✅ 2026-02-15

### B5. Fix Deprecated Code (P1)
- [x] **B5.1** Replace all `datetime.utcnow()` with `datetime.now(timezone.utc)` across 8 files (0 remaining) ✅ 2026-02-15
- [x] **B5.2** Deduplicate `calculate_price_tier()` — single definition in `schemas/artist.py`, imported by tour.py and discover.py ✅ 2026-02-15

### B6. Add Missing Database Indexes (P1)
- [x] **B6.1** Add index `ix_artists_status` on `Artist.status` ✅ 2026-02-15
- [x] **B6.2** Add index `ix_communities_status` on `Community.status` ✅ 2026-02-15
- [x] **B6.3** Add indexes `ix_bookings_artist_id` and `ix_bookings_community_id` ✅ 2026-02-15
- [x] **B6.4** Add index `ix_bookings_status` on `Booking.status` ✅ 2026-02-15
- [x] **B6.5** Created Alembic migration `20260215_000021_add_status_indexes.py` ✅ 2026-02-15

---

## Section C: Frontend Critical Fixes (P0-P1)

### C1. Fix API URL Configuration (P0)
- [x] **C1.1** Update `frontend/.env.local`: change `NEXT_PUBLIC_API_URL` from `http://localhost:8000` to `http://localhost:8001` ✅ 2026-02-15
- [x] **C1.2** Update `frontend/.env.example` to document correct port 8001 ✅ 2026-02-15
- [ ] **C1.3** Verify production env on Vercel points to correct Railway URL *(manual - Vercel dashboard)*

**Files:** `frontend/.env.local`, `frontend/.env.example`

### C2. Implement Token Refresh (P1)
- [x] **C2.1** Add token refresh interceptor in `lib/api.ts` ✅ 2026-02-15
- [x] **C2.2** On 401 response, attempt refresh using stored `refresh_token` ✅ 2026-02-15
- [x] **C2.3** If refresh fails, redirect to `/login` and clear tokens ✅ 2026-02-15
- [x] **C2.4** Shared refresh promise prevents concurrent refresh calls ✅ 2026-02-15

**File:** `frontend/src/lib/api.ts`

### C3. Fix Hardcoded Categories (P1)
- [x] **C3.1** Replace hardcoded categories in `/register/artist/page.tsx` with API call to `/api/categories` ✅ 2026-02-15
- [x] **C3.2** Map API `name_en` to form dropdown options dynamically ✅ 2026-02-15
- [x] **C3.3** Handle loading state while categories load (disabled select + loading text) ✅ 2026-02-15

**File:** `frontend/src/app/register/artist/page.tsx`

### C4. Add Error Handling (P1)
- [x] **C4.1** Add global error boundary component (`app/error.tsx`) ✅ 2026-02-15
- [x] **C4.2** Network error toast already exists via `sonner` + `showError()` ✅ verified
- [ ] **C4.3** Add retry logic for failed data fetches (React Query already supports this — configure `retry: 2`) *(deferred — no React Query in project currently)*
- [x] **C4.4** Add proper 404 and error pages (`app/not-found.tsx`, `app/error.tsx`) ✅ 2026-02-15

**Files:** `frontend/src/app/error.tsx`, `frontend/src/app/not-found.tsx`

---

## Section D: Database & Data Integrity (P1)

### D1. Verify Production Database State
- [ ] **D1.1** Run all Alembic migrations on production Railway DB (`alembic upgrade head`)
- [ ] **D1.2** Verify all 20 migrations applied successfully
- [ ] **D1.3** Check for orphan records (Users without Artist/Community, Bookings without valid community)
- [ ] **D1.4** Verify seed data is appropriate for production (remove test artists if needed)
- [ ] **D1.5** Verify `community_id=1` exists and is valid (referenced by hardcoded fallback)

### D2. Database Backup Strategy
- [ ] **D2.1** Enable Railway automatic backups (if not already)
- [ ] **D2.2** Create manual backup script: `scripts/backup-db.sh`
- [ ] **D2.3** Document backup/restore procedure in `DEPLOYMENT.md`
- [ ] **D2.4** Test backup restore process at least once

### D3. Add Missing Constraints
- [ ] **D3.1** Add CHECK constraint: `member_count_max >= member_count_min` (communities)
- [ ] **D3.2** Add CHECK constraint: `end_date >= start_date` (tours, tour_dates)
- [ ] **D3.3** Create Alembic migration for new constraints

---

## Section E: Authentication & Google OAuth (P1)

### E1. End-to-End Auth Flow Verification
- [ ] **E1.1** Test email/password registration → login → dashboard redirect (all 4 roles)
- [ ] **E1.2** Test Google OAuth registration → login → dashboard redirect
- [ ] **E1.3** Verify role-based access control on all protected endpoints
- [ ] **E1.4** Test token expiry behavior (15-min access, 7-day refresh)
- [ ] **E1.5** Verify CORS allows requests from Vercel production URL

### E2. Google OAuth Production Setup
- [ ] **E2.1** Verify Google Cloud Console authorized origins include:
  - `https://kolamba.vercel.app`
  - `https://kolamba.org` (if custom domain)
  - `http://localhost:3000` (dev)
- [ ] **E2.2** Verify authorized redirect URIs are correct
- [ ] **E2.3** Ensure OAuth consent screen is published (not in testing mode)
- [ ] **E2.4** Test Google Sign-In button renders and works on production

---

## Section F: Deployment & Infrastructure (P1-P2)

### F1. Railway Backend (P1)
- [ ] **F1.1** Verify health check endpoint responds: `GET /api/health`
- [ ] **F1.2** Verify `start.sh` runs migrations before starting server
- [ ] **F1.3** Set `ENV=production` and `DEBUG=false` in Railway env vars
- [ ] **F1.4** Verify SSL is properly configured for Railway internal PostgreSQL
- [ ] **F1.5** Check Railway resource limits and scaling settings

### F2. Vercel Frontend (P1)
- [ ] **F2.1** Verify all environment variables set on Vercel project:
  - `NEXT_PUBLIC_API_URL` → Railway backend URL
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` → Google OAuth client ID
- [ ] **F2.2** Verify build succeeds on Vercel (`npm run build`)
- [ ] **F2.3** Test all pages load on `kolamba.vercel.app`
- [ ] **F2.4** Test preview deployments work for PRs

### F3. Docker Compose Alignment (P2)
- [ ] **F3.1** Update `docker-compose.yml` backend port from 8000 to 8001 (or document the difference)
- [ ] **F3.2** Verify `docker-compose.prod.yml` works end-to-end
- [ ] **F3.3** Verify Nginx config matches current backend/frontend ports

### F4. CI/CD Pipeline (P2)
- [ ] **F4.1** Verify GitHub Actions CI runs on push to `main`
- [ ] **F4.2** Add actual backend tests to CI (currently `pytest` runs but no tests exist)
- [ ] **F4.3** Ensure CI blocks merge on failure
- [ ] **F4.4** Add environment variable validation step

---

## Section G: Backend Improvements (P2)

### G1. Add Structured Logging
- [ ] **G1.1** Add Python `logging` module configuration in `main.py`
- [ ] **G1.2** Add request/response logging middleware (method, path, status, duration)
- [ ] **G1.3** Log authentication events (login, register, failed attempts)
- [ ] **G1.4** Log admin actions (approvals, status changes, deletions)

### G2. Add Rate Limiting
- [ ] **G2.1** Add `slowapi` to requirements
- [ ] **G2.2** Configure rate limits:
  - Auth endpoints: 5 requests/minute per IP
  - Search/list endpoints: 30 requests/minute per IP
  - Booking creation: 10 requests/minute per user
- [ ] **G2.3** Return proper 429 responses with retry-after header

### G3. Improve Cloudinary Integration
- [ ] **G3.1** Add startup validation for Cloudinary config (fail fast if incomplete)
- [ ] **G3.2** Add image size/dimension validation before upload
- [ ] **G3.3** Add cleanup for orphaned uploads

### G4. Email Integration (Resend)
- [ ] **G4.1** Implement email service with Resend SDK
- [ ] **G4.2** Add email templates: welcome, booking confirmation, status change
- [ ] **G4.3** Add email verification on registration (send verification link)
- [ ] **G4.4** Add password reset via email flow
- [ ] **G4.5** Set `RESEND_API_KEY` in Railway env vars

### G5. Fix Lazy Loading & Query Optimization
- [ ] **G5.1** Audit all model relationships for proper `lazy` strategy
- [ ] **G5.2** Ensure `selectinload()` used consistently in list queries
- [ ] **G5.3** Add `.unique()` only where needed (joined queries with collections)

---

## Section H: Frontend Improvements (P2)

### H1. Remove Unused Dependencies
- [ ] **H1.1** Remove `zustand` from package.json (not used)
- [ ] **H1.2** Either implement `next-intl` properly or remove it
- [ ] **H1.3** Run `npm audit` and fix vulnerabilities

### H2. Implement Contact Form
- [ ] **H2.1** Complete CTA section contact form submission (`CTASection.tsx` TODO)
- [ ] **H2.2** Connect to backend endpoint or email service

### H3. Improve Dashboard Experience
- [ ] **H3.1** Add loading skeletons on all dashboard pages
- [ ] **H3.2** Add empty state components ("No bookings yet", "No tours", etc.)
- [ ] **H3.3** Add confirmation dialogs for destructive actions (cancel booking, delete tour)

### H4. Fix AddressAutocomplete
- [ ] **H4.1** Either implement the `AddressAutocomplete` component properly or remove placeholder
- [ ] **H4.2** If implementing, integrate with Google Places API or OpenStreetMap Nominatim

---

## Section I: Testing & QA (P2)

### I1. Backend Tests
- [ ] **I1.1** Create test configuration (`conftest.py` with test DB, fixtures)
- [ ] **I1.2** Write tests for auth endpoints (register, login, refresh, Google OAuth)
- [ ] **I1.3** Write tests for CRUD operations (artists, communities, bookings)
- [ ] **I1.4** Write tests for tour suggestion algorithm
- [ ] **I1.5** Write tests for input validation (dates, required fields)
- [ ] **I1.6** Write tests for role-based access control

### I2. Frontend Tests
- [ ] **I2.1** Add Jest + React Testing Library to project
- [ ] **I2.2** Write tests for API client functions
- [ ] **I2.3** Write tests for critical user flows (login, booking, registration)

### I3. End-to-End Testing
- [ ] **I3.1** Manual walkthrough of all user flows on production:
  - Artist registration → approval → dashboard → tour management
  - Community registration → browse artists → book artist → messaging
  - Admin login → manage users → approve artists → view stats
  - Agent login → manage artists → view bookings
- [ ] **I3.2** Document test results in QA-TRACKER.md

---

## Section J: Git & Repo Hygiene (P2)

### J1. Branch Strategy
- [ ] **J1.1** Create `develop` branch from `main`
- [ ] **J1.2** All fixes go to `develop`, merge to `main` for releases
- [ ] **J1.3** Tag releases: `v1.3.1`, `v1.4.0`, etc.

### J2. Clean Up Repository
- [ ] **J2.1** Remove any test/debug files that shouldn't be in repo
- [ ] **J2.2** Verify `.gitignore` is comprehensive
- [ ] **J2.3** Clean `figma_screenshots/` and `design/` folders (keep only necessary assets)
- [ ] **J2.4** Update `.claude/settings.local.json` to remove exposed credentials

### J3. Commit History
- [ ] **J3.1** Consider squash-merging fix branches to keep clean history
- [ ] **J3.2** Use conventional commits format: `fix:`, `feat:`, `security:`, `docs:`

---

## Section K: Documentation & Handoff (P3)

### K1. Update Project Documentation
- [ ] **K1.1** Update `TECHNICAL_DOCUMENTATION.md` with current endpoint list (50+ endpoints vs documented 40)
- [ ] **K1.2** Update `DEPLOYMENT.md` with correct port numbers and current Railway/Vercel setup
- [ ] **K1.3** Update `README.md` with current project status and setup instructions
- [ ] **K1.4** Update handoff documents with final feature list and known issues

### K2. Create Operations Runbook
- [ ] **K2.1** Document: How to rotate secrets
- [ ] **K2.2** Document: How to run database migrations
- [ ] **K2.3** Document: How to backup/restore database
- [ ] **K2.4** Document: How to rollback a deployment
- [ ] **K2.5** Document: How to monitor logs and health

### K3. API Documentation
- [ ] **K3.1** Verify OpenAPI/Swagger docs at `/api/docs` are complete
- [ ] **K3.2** Add example request/response to key endpoints
- [ ] **K3.3** Document error response formats

---

## Section L: Polish & UX (P3)

### L1. Performance
- [ ] **L1.1** Add caching headers for static content
- [ ] **L1.2** Verify image optimization (Cloudinary transforms, Next.js Image)
- [ ] **L1.3** Test page load times (target: <3s for all pages)

### L2. SEO & Meta
- [ ] **L2.1** Add proper meta tags (title, description, og:image) to all public pages
- [ ] **L2.2** Add sitemap.xml generation
- [ ] **L2.3** Add robots.txt

### L3. Accessibility
- [ ] **L3.1** Verify all forms have proper labels and ARIA attributes
- [ ] **L3.2** Test keyboard navigation on core flows
- [ ] **L3.3** Ensure color contrast meets WCAG AA

---

## Section M: v1.4 - New Features (Post-Fix)

> These are from the project plan (Phases 10-15) and should only be started AFTER all P0-P2 fixes above are complete.

### M1. Map Visualization (Phase 14 from plan)
- [ ] **M1.1** Integrate Leaflet or Mapbox for tour route visualization
- [ ] **M1.2** Show community locations on map
- [ ] **M1.3** Visual tour route display with distance markers

### M2. Notification System
- [ ] **M2.1** In-app notifications for new bookings, messages, tour opportunities
- [ ] **M2.2** Email notifications via Resend
- [ ] **M2.3** Notification preferences per user

### M3. Advanced Search
- [ ] **M3.1** Full-text search with PostgreSQL tsvector indexes
- [ ] **M3.2** Geographic search ("artists near me")
- [ ] **M3.3** Cursor-based pagination for large result sets

### M4. Calendar Integration
- [ ] **M4.1** Artist availability calendar view
- [ ] **M4.2** iCal export for tour dates
- [ ] **M4.3** Date picker integration in booking flow

### M5. Analytics Dashboard
- [ ] **M5.1** Admin analytics: bookings over time, revenue, popular categories
- [ ] **M5.2** Artist analytics: profile views, booking requests
- [ ] **M5.3** Community analytics: engagement metrics

### M6. i18n / Bilingual Support
- [ ] **M6.1** Implement `next-intl` properly with EN/HE translations
- [ ] **M6.2** RTL layout support for Hebrew
- [ ] **M6.3** Language switcher in header
- [ ] **M6.4** All UI strings externalized to translation files

---

## Execution Priority Order

```
Week 1: P0 - Critical (Sections A, B1, C1)
  Day 1: Security fixes (A1, A2, A3)
  Day 2: Google OAuth fix (B1), API URL fix (C1)
  Day 3: Booking auth fix (A3.1-2), transaction safety (B3)

Week 2: P1 - High (Sections B2-B6, C2-C4, D, E, F1-F2)
  Day 4: Agent relationship (B2), input validation (B4)
  Day 5: Token refresh (C2), hardcoded categories (C3)
  Day 6: Database integrity (D), Auth verification (E)
  Day 7: Deployment verification (F1, F2)

Week 3: P2 - Medium (Sections G, H, I, J)
  Day 8-9: Logging, rate limiting, email (G1-G4)
  Day 10: Frontend improvements (H1-H4)
  Day 11-12: Testing (I1-I3)
  Day 13: Git hygiene (J1-J3)

Week 4: P3 - Polish (Sections K, L)
  Day 14: Documentation updates (K1-K3)
  Day 15: Polish & UX (L1-L3)
  Day 16: Final QA walkthrough & client delivery

Post-delivery: Section M (v1.4 features)
```

---

## Progress Tracking

| Section | Total Tasks | Done | % |
|---------|------------|------|---|
| A - Security | 16 | 10 | 63% |
| B - Backend Critical | 17 | 14 | 82% |
| C - Frontend Critical | 11 | 9 | 82% |
| D - Database | 10 | 0 | 0% |
| E - Auth/OAuth | 9 | 0 | 0% |
| F - Deployment | 12 | 0 | 0% |
| G - Backend Improvements | 14 | 0 | 0% |
| H - Frontend Improvements | 8 | 0 | 0% |
| I - Testing | 9 | 0 | 0% |
| J - Git Hygiene | 7 | 0 | 0% |
| K - Documentation | 8 | 0 | 0% |
| L - Polish | 9 | 0 | 0% |
| M - v1.4 Features | 15 | 0 | 0% |
| **TOTAL** | **145** | **33** | **23%** |

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-02-15 | Initial plan created from full codebase audit | Claude + Avi |
| 2026-02-15 | Section A: Security fixes (A1.5-A1.7, A2.1-A2.5, A3.1-A3.2) completed | Claude |
| 2026-02-15 | Section B: Backend critical fixes (B1-B6) — OAuth, model, validation, indexes | Claude |
| 2026-02-15 | Section C: Frontend critical fixes (C1-C4) — API URL, token refresh, dynamic categories, error pages | Claude |

---

*This document is the single source of truth for the fix-to-deliver process. Update after each work session.*
