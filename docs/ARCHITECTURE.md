# Kolamba - Technical Architecture Document

**Project:** פלטפורמת Marketplace לסיורי אמנים בקהילות יהודיות
**Proposal:** PP-KOL-002-26 v2.0
**Date:** 2026-01-19
**Duration:** 4 weeks (40 hours)

---

## 1. Project Overview

### 1.1 Vision
Kolamba is a two-sided marketplace connecting Israeli/Jewish artists with Jewish communities worldwide. The platform enables artists to showcase their profiles and communities to discover and book performances.

### 1.2 MVP Scope
| Module | Description |
|--------|-------------|
| Homepage | Kolamba vision, artist search, featured artists |
| Artist Profiles | Biography, performance categories, pricing, availability, contact |
| Community Profiles | Name, geographic location, audience size, language |
| Advanced Search | Filter by art category, price, language, region, dates |
| Booking Process | Send request, coordinate details, approve/reject |
| Tour Logic | Algorithm for building tours based on location, availability, community size |

### 1.3 MVP Limits
- Registered users: up to 500
- Concurrent users: up to 50
- Data volume: up to 10GB

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Desktop/Mobile)    │    Admin Panel                   │
└──────────────┬───────────────┴──────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN (CloudFlare)                           │
│              Static Assets / SSL Termination                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY / RENDER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Frontend      │    │    Backend      │                    │
│  │   (Next.js)     │    │   (FastAPI)     │                    │
│  │   Port 3000     │    │   Port 8000     │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      │                                          │
│           ┌──────────▼──────────┐                              │
│           │   PostgreSQL DB     │                              │
│           │   (Railway)         │                              │
│           └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Pattern
- **Pattern:** Monolithic with clear separation (API-first)
- **Reason:** MVP scope, 40 hours budget, single developer
- **Future:** Can split to microservices if needed

---

## 3. Technology Stack

### 3.1 Backend
| Component | Technology | Justification |
|-----------|------------|---------------|
| Language | Python 3.11+ | Fast development, good ecosystem |
| Framework | FastAPI | Async, auto-docs, type hints, fast |
| ORM | SQLAlchemy 2.0 | Mature, flexible, async support |
| Database | PostgreSQL 15 | Reliable, JSON support, spatial queries |
| Migrations | Alembic | Standard for SQLAlchemy |
| Validation | Pydantic v2 | Built into FastAPI |

### 3.2 Frontend
| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | Next.js 14 | SSR/SSG, good SEO, React ecosystem |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid development, consistent design |
| State | React Query + Zustand | Server state + client state |
| Forms | React Hook Form + Zod | Validation, performance |
| i18n | next-intl | Hebrew + English support |

### 3.3 Infrastructure
| Component | Technology | Justification |
|-----------|------------|---------------|
| Hosting | Railway | Simple deployment, PostgreSQL included |
| CDN | Cloudflare | Free tier, SSL, caching |
| File Storage | Cloudflare R2 / Railway Volume | Images, documents |
| Email | Resend / SendGrid | Transactional emails |
| Monitoring | Railway metrics + Sentry | Error tracking |

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │   categories    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email           │       │ name_he         │
│ password_hash   │       │ name_en         │
│ role (enum)     │       │ slug            │
│ created_at      │       │ icon            │
│ updated_at      │       └─────────────────┘
└────────┬────────┘                │
         │                         │
         │ 1:1                     │ M:N
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│    artists      │◄──────│artist_categories│
├─────────────────┤       └─────────────────┘
│ id (PK)         │
│ user_id (FK)    │       ┌─────────────────┐
│ name_he         │       │  communities    │
│ name_en         │       ├─────────────────┤
│ bio_he          │       │ id (PK)         │
│ bio_en          │       │ user_id (FK)    │
│ profile_image   │       │ name            │
│ price_single    │       │ location        │
│ price_tour      │       │ lat/lng         │
│ languages[]     │       │ audience_size   │
│ availability{}  │       │ language        │
│ status          │       │ status          │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │         ┌───────────────┘
         │         │
         ▼         ▼
┌─────────────────────────┐
│      bookings           │
├─────────────────────────┤
│ id (PK)                 │
│ artist_id (FK)          │
│ community_id (FK)       │
│ requested_date          │
│ location                │
│ budget                  │
│ notes                   │
│ status (enum)           │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

### 4.2 Database Tables

```sql
-- Users (authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('artist', 'community', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    name_he VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    bio_he TEXT,
    bio_en TEXT,
    profile_image VARCHAR(500),
    price_single INTEGER, -- in USD
    price_tour INTEGER,   -- in USD
    languages VARCHAR(50)[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Israel',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name_he VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

-- Artist-Category junction
CREATE TABLE artist_categories (
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (artist_id, category_id)
);

-- Communities
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    audience_size VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES artists(id),
    community_id INTEGER REFERENCES communities(id),
    requested_date DATE,
    location VARCHAR(255),
    budget INTEGER,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed categories
INSERT INTO categories (name_he, name_en, slug, icon, sort_order) VALUES
('שירה', 'Singing', 'singing', 'music', 1),
('חזנות', 'Cantorial', 'cantorial', 'synagogue', 2),
('הרצאה', 'Lecture', 'lecture', 'presentation', 3),
('סדנה', 'Workshop', 'workshop', 'users', 4),
('מופע לילדים', 'Children Show', 'children', 'child', 5),
('ריקוד', 'Dance', 'dance', 'dance', 6),
('תיאטרון', 'Theater', 'theater', 'theater', 7),
('מוסיקה', 'Music', 'music-instrumental', 'guitar', 8);
```

---

## 5. Backend Architecture (API)

### 5.1 Project Structure

```
kolamba-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Settings & environment
│   ├── database.py          # DB connection
│   │
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── artist.py
│   │   ├── community.py
│   │   ├── category.py
│   │   └── booking.py
│   │
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── artist.py
│   │   ├── community.py
│   │   └── booking.py
│   │
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py          # Login, register
│   │   ├── artists.py       # Artist CRUD
│   │   ├── communities.py   # Community CRUD
│   │   ├── categories.py    # Categories list
│   │   ├── bookings.py      # Booking flow
│   │   ├── search.py        # Search & filter
│   │   └── tours.py         # Tour logic
│   │
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── tour_builder.py  # Tour algorithm
│   │   └── email.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py      # JWT, password hashing
│       └── geo.py           # Distance calculations
│
├── alembic/                 # Migrations
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

### 5.2 API Endpoints

#### Authentication
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login, get JWT
POST   /api/auth/refresh      # Refresh token
GET    /api/auth/me           # Current user
```

#### Artists
```
GET    /api/artists           # List artists (with filters)
GET    /api/artists/featured  # Featured artists
GET    /api/artists/{id}      # Artist profile
POST   /api/artists           # Create artist profile (auth)
PUT    /api/artists/{id}      # Update artist profile (auth)
```

#### Communities
```
GET    /api/communities       # List communities
GET    /api/communities/{id}  # Community profile
POST   /api/communities       # Register community (auth)
PUT    /api/communities/{id}  # Update community (auth)
```

#### Categories
```
GET    /api/categories        # List all categories
```

#### Search
```
GET    /api/search/artists    # Search artists
  ?category=singing
  &min_price=100
  &max_price=500
  &language=Hebrew
  &region=northeast
  &available_from=2026-03-01
  &available_to=2026-03-15
```

#### Bookings
```
POST   /api/bookings          # Create booking request
GET    /api/bookings          # List my bookings (auth)
GET    /api/bookings/{id}     # Booking details
PUT    /api/bookings/{id}     # Update booking status
```

#### Tours
```
POST   /api/tours/suggest     # Get tour suggestions
  Body: {
    "artist_id": 1,
    "start_date": "2026-03-01",
    "end_date": "2026-03-15",
    "start_location": "New York"
  }
```

### 5.3 Tour Algorithm (MVP)

```python
# services/tour_builder.py

from typing import List
from geopy.distance import geodesic

def suggest_tour(
    artist_id: int,
    start_date: date,
    end_date: date,
    start_location: tuple[float, float],
    max_communities: int = 5
) -> List[dict]:
    """
    Build tour suggestions based on:
    1. Geographic proximity (cluster nearby communities)
    2. Artist availability on requested dates
    3. Community audience size (prioritize larger audiences)

    Returns ordered list of suggested stops.
    """

    # 1. Get all communities with lat/lng
    communities = get_communities_with_location()

    # 2. Filter by artist availability
    available_dates = get_artist_availability(artist_id, start_date, end_date)

    # 3. Calculate distances from start location
    for community in communities:
        community['distance'] = geodesic(
            start_location,
            (community['lat'], community['lng'])
        ).miles

    # 4. Score communities: proximity + audience size
    for community in communities:
        # Lower distance = higher score (normalize to 0-50)
        distance_score = max(0, 50 - (community['distance'] / 100))

        # Larger audience = higher score (normalize to 0-50)
        audience_score = audience_size_to_score(community['audience_size'])

        community['score'] = distance_score + audience_score

    # 5. Sort by score, return top N
    communities.sort(key=lambda x: x['score'], reverse=True)

    # 6. Optimize route order (simple greedy nearest neighbor)
    tour = optimize_route(communities[:max_communities], start_location)

    return tour
```

---

## 6. Frontend Architecture

### 6.1 Project Structure

```
kolamba-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── artists/
│   │   │   │   ├── page.tsx    # Artist listing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Artist profile
│   │   │   ├── search/
│   │   │   │   └── page.tsx    # Search results
│   │   │   └── categories/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (auth)/             # Auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── register/artist/
│   │   │
│   │   ├── (dashboard)/        # Protected pages
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── bookings/
│   │   │   └── availability/
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                 # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── artists/
│   │   │   ├── ArtistCard.tsx
│   │   │   ├── ArtistGrid.tsx
│   │   │   └── ArtistProfile.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── SearchResults.tsx
│   │   └── booking/
│   │       ├── BookingForm.tsx
│   │       └── BookingStatus.tsx
│   │
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # Auth utilities
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useArtists.ts
│   │   ├── useSearch.ts
│   │   └── useBooking.ts
│   │
│   ├── stores/
│   │   └── authStore.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
│   ├── images/
│   └── locales/
│       ├── he/
│       │   └── common.json
│       └── en/
│           └── common.json
│
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### 6.2 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero, search, featured artists, categories |
| Artist Listing | `/artists` | Grid of artists with filters |
| Artist Profile | `/artists/[id]` | Full profile, booking CTA |
| Category Page | `/categories/[slug]` | Artists by category |
| Search Results | `/search` | Filtered results |
| Login | `/login` | Sign in |
| Register Artist | `/register/artist` | Artist signup |
| Register Community | `/register/community` | Community signup |
| Dashboard | `/dashboard` | User dashboard |
| My Bookings | `/bookings` | Booking history |

---

## 7. URL Structure

### 7.1 Public URLs

```
/                           # Homepage
/artists                    # All artists
/artists/[id]               # Artist profile (e.g., /artists/123)
/artists/[id]/book          # Booking form
/categories                 # All categories
/categories/[slug]          # Category artists (e.g., /categories/singing)
/search                     # Search with query params
/about                      # About Kolamba
/contact                    # Contact page
```

### 7.2 Auth URLs

```
/login                      # Sign in
/register                   # Registration choice
/register/artist            # Artist registration
/register/community         # Community registration
/forgot-password            # Password reset
```

### 7.3 Dashboard URLs (Protected)

```
/dashboard                  # Main dashboard
/dashboard/profile          # Edit profile
/dashboard/availability     # Manage availability (artists)
/dashboard/bookings         # View bookings
/dashboard/bookings/[id]    # Booking details
```

### 7.4 API URLs

```
/api/v1/...                 # All API endpoints prefixed
```

---

## 8. UX/UI Design System

### 8.1 Design Principles
1. **Bilingual First:** RTL (Hebrew) and LTR (English) support
2. **Mobile First:** Responsive design, touch-friendly
3. **Warm & Modern:** Jewish cultural aesthetic, not sterile
4. **Fast:** Optimistic UI, skeleton loaders
5. **Accessible:** WCAG 2.1 AA compliance

### 8.2 Color Palette

```css
:root {
  /* Primary - Warm Blue (trust, professionalism) */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Secondary - Teal (creativity, culture) */
  --secondary-500: #14b8a6;
  --secondary-600: #0d9488;

  /* Accent - Gold (premium, Jewish heritage) */
  --accent-500: #f59e0b;
  --accent-600: #d97706;

  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

### 8.3 Typography

```css
/* Hebrew */
font-family: 'Open Sans Hebrew', 'Rubik', sans-serif;

/* English */
font-family: 'Inter', 'Open Sans', sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 8.4 Component Library

Using **shadcn/ui** (Radix + Tailwind) for components:
- Button, Input, Select, Checkbox
- Card, Dialog, Dropdown
- Table, Tabs, Toast
- Form components with validation

### 8.5 Key UI Patterns

1. **Artist Card**
   - Profile image (square, rounded)
   - Name, category badges
   - Price range
   - Rating (future)
   - Quick actions (view, book)

2. **Search Bar**
   - Prominent on homepage
   - Category quick filters
   - Location autocomplete
   - Date range picker

3. **Booking Flow**
   - Step 1: Select dates
   - Step 2: Location & details
   - Step 3: Message to artist
   - Step 4: Confirmation

---

## 9. Security

### 9.1 Authentication

```python
# JWT-based authentication
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- HttpOnly cookies for refresh token
- Bearer token in Authorization header for access

# Password requirements
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- bcrypt hashing with cost factor 12
```

### 9.2 Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| `artist` | Edit own profile, manage availability, view bookings |
| `community` | Search artists, create bookings, view own bookings |
| `admin` | All permissions, manage users, content moderation |

### 9.3 Security Measures

```yaml
API Security:
  - CORS: Whitelist allowed origins
  - Rate limiting: 100 req/min per IP
  - Input validation: Pydantic schemas
  - SQL injection: SQLAlchemy ORM
  - XSS: React escaping + CSP headers

Data Security:
  - HTTPS only (enforce SSL)
  - Sensitive data encryption at rest
  - Password hashing (bcrypt)
  - JWT signed with RS256

Infrastructure:
  - Environment variables for secrets
  - Database credentials rotation
  - Regular security updates
```

### 9.4 GDPR Compliance

```
- Privacy policy page
- Cookie consent banner
- Data export on request
- Account deletion option
- Minimal data collection
```

---

## 10. Deployment & Infrastructure

### 10.1 Environment Strategy

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `localhost:3000` | Local development |
| Staging | `staging.kolamba.com` | Testing before production |
| Production | `kolamba.com` | Live site |

### 10.2 Railway Deployment

```yaml
# railway.toml (Backend)
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"

# Environment Variables
DATABASE_URL = "postgresql://..."
SECRET_KEY = "..."
CORS_ORIGINS = "https://kolamba.com"
```

```yaml
# Frontend deployment
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

### 10.3 Domain & DNS

```
Domain: kolamba.com (purchase required)

DNS Records:
  A     @           -> Railway IP
  CNAME www         -> kolamba.com
  CNAME api         -> backend.railway.app

Cloudflare:
  - SSL: Full (strict)
  - Cache: Static assets
  - WAF: Basic rules
```

### 10.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          pip install -r requirements.txt
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railwayapp/railway-action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 11. Git Repository Structure

### 11.1 Repository Setup

```
Option A: Monorepo (Recommended for MVP)
----------------------------------------
kolamba/
├── backend/           # FastAPI app
├── frontend/          # Next.js app
├── shared/            # Shared types/constants
├── docs/              # Documentation
├── scripts/           # Deployment scripts
├── docker-compose.yml # Local development
└── README.md

Option B: Separate Repos (for larger teams)
-------------------------------------------
kolamba-backend/
kolamba-frontend/
kolamba-docs/
```

### 11.2 Branch Strategy

```
main          # Production-ready code
├── develop   # Integration branch
├── feature/* # New features
├── fix/*     # Bug fixes
└── release/* # Release preparation
```

### 11.3 Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, api, ui, db

Examples:
  feat(api): add artist search endpoint
  fix(ui): correct RTL layout on mobile
  docs(readme): update deployment instructions
```

---

## 12. Development Workflow

### 12.1 Local Setup

```bash
# Clone repository
git clone https://github.com/kolamba/kolamba.git
cd kolamba

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with local settings
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 12.2 Development Tools

```yaml
Backend:
  - Black: Code formatting
  - Ruff: Linting
  - pytest: Testing
  - pre-commit: Git hooks

Frontend:
  - ESLint: Linting
  - Prettier: Formatting
  - TypeScript: Type checking
  - Vitest: Testing
```

### 12.3 Testing Strategy

```
Unit Tests:
  - Backend: pytest (services, utils)
  - Frontend: Vitest (components, hooks)

Integration Tests:
  - API: pytest with TestClient
  - E2E: Playwright (critical paths)

Test Coverage Target: 70%
```

---

## 13. MVP Deliverables Checklist

### Week 1: Foundation (6 hours)
- [ ] Project setup (repos, CI/CD)
- [ ] Database schema & migrations
- [ ] Basic API structure
- [ ] Homepage wireframe
- [ ] Design system setup

### Week 2: Core Features (14 hours)
- [ ] Homepage implementation
- [ ] Artist listing & profiles
- [ ] Search functionality
- [ ] Category filtering
- [ ] Artist registration

### Week 3: Booking & Tours (14 hours)
- [ ] Community registration
- [ ] Booking request flow
- [ ] Tour suggestion algorithm
- [ ] Dashboard (basic)
- [ ] Email notifications

### Week 4: Polish & Launch (6 hours)
- [ ] QA & bug fixes
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Documentation
- [ ] Handover

---

## 14. Post-MVP Roadmap

### Phase 2: Enhanced Features
- Payment integration (Stripe)
- Tour management system
- Calendar sync

### Phase 3: Growth
- Ratings & reviews
- AI recommendations
- Mobile app (React Native)

### Phase 4: Scale
- Multi-region deployment
- Advanced analytics
- Partner integrations

---

## Appendix A: Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/kolamba
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,https://kolamba.com
SENDGRID_API_KEY=your-sendgrid-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Appendix B: Reference Sites

- **GigSalad:** gigsalad.com (competitor reference)
- **The Bash:** thebash.com (competitor reference)
- **AGNT:** agnt.com (design inspiration)
- **Tablet Magazine:** tabletmag.com (Jewish aesthetic)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Author:** Drishti Consulting
