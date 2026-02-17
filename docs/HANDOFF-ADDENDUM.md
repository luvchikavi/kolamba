# Kolamba - Handoff Addendum (v1.4)

**Date:** 2026-02-17
**Author:** Drishti Consulting

This addendum supplements the original project handoff document with the final feature list, v1.4 additions, and known issues.

---

## Final Feature List (v1.4)

### Core Platform (Delivered in v1.0-v1.3)
- Artist registration with multi-step form + Cloudinary image uploads
- Community registration with address autocomplete (OpenStreetMap)
- Google OAuth + email/password authentication with JWT refresh tokens
- Artist directory with category filtering, search, and featured artists
- Community directory with location data
- Booking system with conversation threads (messaging)
- Admin dashboard: user management, artist approval, booking overview, stats
- Agent dashboard: manage multiple artists
- Community dashboard: discover artists, manage bookings, quotes
- Artist dashboard: manage profile, tour dates, bookings, messages
- Tour suggestion algorithm with multi-factor scoring (geographic clustering, audience, budget, dates)
- Tour discovery for communities (find nearby touring artists)
- Responsive design with Tailwind CSS
- Rate limiting (slowapi) on all endpoints
- Structured request logging with duration tracking
- Email service integration (Resend SDK)
- Contact form
- CI/CD pipeline (GitHub Actions)
- Docker Compose for local + production

### New in v1.4
- **Full-text search** — PostgreSQL tsvector with relevance ranking (`ts_rank`), "simple" config for Hebrew+English
- **Admin analytics** — Platform growth charts (LineChart), booking status (PieChart), artists by category (BarChart) using recharts
- **Map visualization** — Leaflet maps showing community locations and artist tour dates with colored markers
- **Calendar integration** — Interactive month-view calendar on artist pages + iCal export (.ics download)
- **In-app notifications** — Notification bell in header, unread count badge, auto-notify on new bookings, mark read/all-read
- **i18n bilingual support** — next-intl with EN/HE translations (~100 strings), RTL layout support, language switcher in header
- **Caching headers** — Static assets (1 year immutable), API responses (60s-300s with stale-while-revalidate), security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **Tour suggestion tests** — 45 unit tests for the grouping algorithm (Haversine, clustering, scoring, date windowing)
- **Frontend test suite** — Jest + React Testing Library with 26 tests (API client, favorites module)

---

## Test Coverage

| Suite | Tests | Framework |
|-------|-------|-----------|
| Backend: Auth | 10 | pytest + httpx |
| Backend: Artists CRUD | 5 | pytest + httpx |
| Backend: Bookings CRUD | 6 | pytest + httpx |
| Backend: RBAC | 9 | pytest + httpx |
| Backend: Validation | 8 | pytest + httpx |
| Backend: Tour Grouping | 45 | pytest (unit) |
| Frontend: API Client | 9 | Jest + ts-jest |
| Frontend: Favorites | 17 | Jest + ts-jest |
| **Total** | **109** | |

---

## API Endpoints Summary

**Total: 90+ endpoints** across 14 routers

| Router | Prefix | Count | Auth Required |
|--------|--------|-------|---------------|
| Auth | `/api/auth` | 7 | Partial |
| Artists | `/api/artists` | 8 | Partial |
| Tour Dates | `/api/artists/{id}/tour-dates` | 7 | Partial |
| Communities | `/api/communities` | 8 | Partial |
| Categories | `/api/categories` | 5 | Admin for write |
| Bookings | `/api/bookings` | 5 | Yes |
| Search | `/api/search` | 2 | No |
| Tours | `/api/tours` | 12 | Partial |
| Admin | `/api/admin` | 12 | Superuser |
| Agents | `/api/agents` | 6 | Agent role |
| Uploads | `/api/uploads` | 2 | Yes |
| Conversations | `/api/conversations` | 4 | Yes |
| Notifications | `/api/notifications` | 5 | Yes |
| Health/Contact | `/api` | 3 | No |

Full API docs: `/api/docs` (Swagger UI) | Examples: `docs/API-EXAMPLES.md`

---

## Known Issues & Limitations

### Not Blocking Delivery
1. **Google OAuth not fully tested** — Backend code is correct (uses `google-auth` library), but Google Cloud Console setup needs to be done by the client (authorized origins, redirect URIs, consent screen)
2. **Email verification** — Users can register without verifying email. Requires a verification token table (deferred)
3. **Password reset** — No "forgot password" email flow yet (deferred)
4. **Geographic search** — "Artists near me" requires PostGIS extension + browser geolocation (deferred)
5. **Artist/community analytics** — Individual profile view tracking not implemented (requires event tracking table)

### Manual Setup Required (Post-Transfer)
1. Rotate all secrets (SECRET_KEY, Google, Cloudinary, DB password)
2. Set `ENV=production` and `DEBUG=false` in Railway
3. Set `RESEND_API_KEY` in Railway for email to work
4. Verify Vercel env vars point to correct Railway URL
5. Enable Railway automatic database backups

---

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel CDN    │────▶│  Next.js 14      │────▶│ FastAPI      │
│   (Frontend)    │     │  App Router      │     │ (Port 8001)  │
│                 │     │  React 18        │     │ SQLAlchemy   │
│                 │     │  Tailwind CSS    │     │ async        │
└─────────────────┘     │  next-intl       │     └──────┬───────┘
                        │  recharts        │            │
                        │  Leaflet         │            ▼
                        └──────────────────┘     ┌──────────────┐
                                                 │ PostgreSQL   │
                        ┌──────────────────┐     │ (Railway)    │
                        │  Cloudinary      │     │ + tsvector   │
                        │  (Media CDN)     │     └──────────────┘
                        └──────────────────┘
                        ┌──────────────────┐
                        │  Resend          │
                        │  (Email API)     │
                        └──────────────────┘
```

---

## File Structure (Key Files)

```
backend/
  app/
    main.py                    # FastAPI app + middleware
    config.py                  # Settings (env vars)
    database.py                # SQLAlchemy async engine
    routers/                   # 14 API routers
    models/                    # 11 SQLAlchemy models
    schemas/                   # Pydantic validation
    services/
      tour_grouping.py         # Tour suggestion algorithm
      interest_matching.py     # Category matching
      email.py                 # Resend email service
      geocoding.py             # OpenStreetMap geocoding
  alembic/                     # 24 DB migrations
  tests/                       # 83 backend tests

frontend/
  src/
    app/                       # Next.js pages (App Router)
    components/
      calendar/                # Tour dates calendar
      dashboard/               # Dashboard components
      home/                    # Homepage sections
      i18n/                    # Language switcher
      layout/                  # Header, Footer
      maps/                    # Leaflet map components
      notifications/           # Notification bell
    i18n/
      messages/en.json         # English translations
      messages/he.json         # Hebrew translations
      config.ts                # Locale config
      provider.tsx             # LocaleProvider
    lib/
      api.ts                   # API client + types
      favorites.ts             # Client-side favorites
      providers.tsx            # React Query + i18n providers
```
