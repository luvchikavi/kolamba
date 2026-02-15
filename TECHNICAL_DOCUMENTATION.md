# Kolamba - Technical Documentation

## Project Overview

**Kolamba** is a two-sided marketplace platform connecting Israeli/Jewish artists with Jewish communities worldwide. The platform enables communities to discover, book, and coordinate performances, workshops, and cultural events with artists.

### Live URLs
- **Frontend (Staging)**: https://kolamba.vercel.app
- **Backend API**: https://kolamba-production.up.railway.app
- **API Documentation**: https://kolamba-production.up.railway.app/api/docs
- **Production Site**: https://kolamba.org (existing site for content reference)

### Repository
- **GitHub**: https://github.com/luvchikavi/kolamba

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 14 (App Router)                      │
│                 TypeScript + Tailwind CSS                        │
│                    Hosted on Vercel                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    FastAPI (Python 3.11)                        │
│               SQLAlchemy 2.0 (Async) + Alembic                  │
│                    Hosted on Railway                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ asyncpg
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                    PostgreSQL 15                                 │
│                    Hosted on Railway                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.x | Utility-first CSS |
| React | 18.x | UI library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.0 | Modern Python web framework |
| SQLAlchemy | 2.0.25 | Async ORM |
| Alembic | 1.13.1 | Database migrations |
| asyncpg | 0.29.0 | Async PostgreSQL driver |
| Pydantic | 2.5.3 | Data validation |
| python-jose | 3.3.0 | JWT authentication |
| passlib/bcrypt | 1.7.4 | Password hashing |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Vercel | Next.js deployment |
| Backend Hosting | Railway | FastAPI + PostgreSQL |
| Database | Railway PostgreSQL | Data persistence |
| Version Control | GitHub | Source code management |

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │   Artists    │       │ Communities  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ user_id (FK) │───────│ user_id (FK) │
│ password     │       │ name_he      │       │ name         │
│ role         │       │ name_en      │       │ contact_name │
│ is_active    │       │ bio_he       │       │ email        │
│ created_at   │       │ bio_en       │       │ phone        │
└──────────────┘       │ location     │       │ country      │
                       │ phone        │       │ city         │
                       │ email        │       │ latitude     │
                       │ website      │       │ longitude    │
                       │ image_url    │       │ created_at   │
                       │ video_url    │       └──────────────┘
                       │ price_range  │              │
                       │ is_available │              │
                       │ created_at   │              │
                       └──────────────┘              │
                              │                      │
                              │                      │
                    ┌─────────┴─────────┐            │
                    ▼                   ▼            ▼
            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
            │ArtistCategory│    │   Bookings   │    │    Tours     │
            ├──────────────┤    ├──────────────┤    ├──────────────┤
            │ artist_id    │    │ id (PK)      │    │ id (PK)      │
            │ category_id  │    │ artist_id    │    │ artist_id    │
            └──────────────┘    │ community_id │    │ name         │
                    │           │ event_date   │    │ start_date   │
                    ▼           │ event_type   │    │ end_date     │
            ┌──────────────┐    │ status       │    │ status       │
            │  Categories  │    │ message      │    │ created_at   │
            ├──────────────┤    │ created_at   │    └──────────────┘
            │ id (PK)      │    └──────────────┘           │
            │ name_he      │                               │
            │ name_en      │                               ▼
            │ slug         │                       ┌──────────────┐
            │ icon         │                       │ TourBookings │
            └──────────────┘                       ├──────────────┤
                                                   │ tour_id      │
                                                   │ booking_id   │
                                                   │ order        │
                                                   └──────────────┘
```

### Models Detail

#### Users
- Primary authentication entity
- Roles: `artist`, `community`, `admin`, `agent`
- Links to Artist or Community profile
- `is_superuser` flag for admin access

#### Artists
- Hebrew and English content support
- Categories (many-to-many)
- Price ranges: `budget`, `moderate`, `premium`
- Availability status

#### Communities
- Geographic location with coordinates
- Used for tour grouping algorithm

#### Categories
- Predefined: Music, Dance, Theater, Visual Arts, Workshops, Lectures
- Bilingual names (Hebrew/English)

#### Bookings
- Status flow: `pending` → `confirmed` → `completed` (or `cancelled`)
- Event types: `performance`, `workshop`, `lecture`, `exhibition`, `other`

#### Tours
- Groups multiple bookings geographically
- Uses Haversine formula for distance calculation
- Status: `draft`, `proposed`, `confirmed`, `completed`, `cancelled`

---

## API Endpoints (83 total)

### Authentication (`/api/auth`) — 7 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (community/artist) |
| POST | `/register/artist` | Register artist with profile |
| POST | `/login` | Login and get tokens (OAuth2) |
| POST | `/refresh` | Refresh access token |
| POST | `/google` | Google OAuth authentication |
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update current user profile |

### Artists (`/api/artists`) — 9 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List artists (filters: category, price, language) |
| GET | `/featured` | List featured artists |
| GET | `/me` | Get own artist profile |
| PUT | `/me` | Update own artist profile |
| GET | `/{id}` | Get artist by ID |
| GET | `/discover` | Discover artists (community dashboard) |
| GET | `/categories` | Get categories with artist counts |
| POST | `/seed` | Seed demo artist data |
| GET | `/{id}/availability` | Get artist availability |

### Communities (`/api/communities`) — 12 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all communities |
| GET | `/me` | Get own community profile |
| PUT | `/me` | Update own community profile |
| GET | `/me/dashboard` | Community dashboard data |
| GET | `/me/discover` | Discover artists for community |
| GET | `/{id}` | Get community by ID |
| PUT | `/{id}` | Update community |
| GET | `/{id}/bookings` | Get community bookings |
| GET | `/stats` | Community statistics |
| POST | `/` | Create community profile |
| GET | `/options/types` | List community type options |
| GET | `/options/events` | List event type options |

### Bookings (`/api/bookings`) — 6 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List bookings (filters: status, artist, community) |
| GET | `/my-bookings` | Get own bookings with artist names |
| POST | `/` | Create booking request (rate limited) |
| GET | `/{id}` | Get booking details |
| PUT | `/{id}` | Update booking (approve/reject) |
| DELETE | `/{id}` | Cancel booking |

### Tours (`/api/tours`) — 14 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suggestions/{artist_id}` | Get tour suggestions |
| POST | `/` | Create tour from bookings |
| GET | `/{id}` | Get tour details |
| PUT | `/{id}` | Update tour |
| POST | `/{id}/bookings/{booking_id}` | Add booking to tour |
| DELETE | `/{id}/bookings/{booking_id}` | Remove booking from tour |
| PUT | `/{id}/reorder` | Reorder tour stops |
| GET | `/artist/{artist_id}` | Get tours for artist |
| And more... | See `/api/docs` | Full tour management |

### Admin (`/api/admin`) — 12 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | List all users |
| PUT | `/users/{id}` | Update user |
| POST | `/users/{id}/deactivate` | Deactivate user |
| GET | `/artists` | List artists for review |
| PUT | `/artists/{id}/status` | Approve/reject artist |
| GET | `/bookings` | List all bookings |
| PUT | `/bookings/{id}/status` | Update booking status |
| POST | `/seed-superusers` | Seed admin accounts |
| POST | `/seed-categories` | Seed categories |
| POST | `/seed-communities` | Seed communities |
| POST | `/seed-demo` | Seed demo data |

### Agents (`/api/agents`) — 3 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me/artists` | Agent's artist roster |
| GET | `/me/stats` | Agent dashboard stats |
| GET | `/me/bookings` | Agent's bookings |

### Conversations (`/api/conversations`) — 4 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{booking_id}` | Get conversation for booking |
| POST | `/{booking_id}/messages` | Send message |
| GET | `/my` | Get all my conversations |
| PUT | `/{id}/read` | Mark conversation as read |

### Uploads (`/api/uploads`) — 6 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/image` | Upload image to Cloudinary |
| POST | `/video` | Upload video |
| POST | `/portfolio` | Upload portfolio images |
| DELETE | `/{public_id}` | Delete uploaded file |
| GET | `/my` | List own uploads |
| GET | `/config` | Check upload config status |

### Artist Tour Dates (`/api/artist-tour-dates`) — 6 endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List tour dates |
| POST | `/` | Create tour date |
| PUT | `/{id}` | Update tour date |
| DELETE | `/{id}` | Delete tour date |
| GET | `/artist/{artist_id}` | Tour dates for artist |
| GET | `/upcoming` | Upcoming tour dates |

### Categories (`/api/categories`) — 1 endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all categories |

### Search (`/api/search`) — 1 endpoint (rate limited)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Search artists by query |

### Other (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/contact` | Contact form (rate limited) |

---

## Frontend Pages

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page with hero, search, categories |
| `/artists` | ArtistsPage | Browse all artists with filters |
| `/artists/[id]` | ArtistDetailPage | Individual artist profile |
| `/categories` | CategoriesPage | Browse by category |
| `/search` | SearchPage | Search results |
| `/login` | LoginPage | User authentication |
| `/register/community` | CommunityRegisterPage | Community registration |

### Protected Pages (Authentication Required)
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Role-based dashboard |
| `/dashboard/artist` | ArtistDashboard | Artist management |
| `/dashboard/community` | CommunityDashboard | Community management |

### Components Structure
```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related pages
│   ├── artists/           # Artist pages
│   ├── categories/        # Category pages
│   ├── dashboard/         # Dashboard pages
│   └── search/            # Search page
├── components/
│   ├── layout/            # Header, Footer, Navigation
│   ├── artists/           # Artist cards, lists
│   ├── booking/           # Booking form
│   ├── search/            # Search components
│   └── ui/                # Reusable UI components
├── lib/
│   └── api.ts             # API client
└── types/
    └── index.ts           # TypeScript types
```

---

## Completed Development Phases

### Phase 1: Project Setup ✅
- [x] Initialize Next.js 14 with TypeScript
- [x] Set up FastAPI backend structure
- [x] Configure PostgreSQL with SQLAlchemy async
- [x] Set up Alembic for migrations
- [x] Create base Docker configurations

### Phase 2: Core Models & API ✅
- [x] User model with authentication fields
- [x] Artist model with bilingual support
- [x] Community model with geolocation
- [x] Category model with Hebrew/English
- [x] Booking model with status workflow
- [x] CRUD endpoints for all entities

### Phase 3: Frontend Foundation ✅
- [x] Layout components (Header, Footer)
- [x] Homepage with hero section
- [x] Artist listing page with grid
- [x] Artist detail page
- [x] Category browsing
- [x] Search functionality
- [x] Responsive design (mobile-first)

### Phase 4: Booking System ✅
- [x] Booking form component
- [x] Booking API integration
- [x] Community registration page
- [x] Community API endpoints

### Phase 5: Tour Logic ✅
- [x] Tour model and relationships
- [x] Haversine distance calculation
- [x] Geographic clustering algorithm
- [x] Tour suggestion API
- [x] Tour management endpoints

### Phase 6: Authentication ✅
- [x] JWT token implementation
- [x] Login/Register endpoints
- [x] Token refresh mechanism
- [x] Protected routes
- [x] Role-based access

### Phase 7: Deployment ✅
- [x] Production Dockerfile
- [x] Railway backend deployment
- [x] Vercel frontend deployment
- [x] Environment configuration
- [x] Database migrations in production

---

### Phase 8: Content & Localization ✅
- [x] Full English language support (English-only version)
- [x] Removed language switcher (English-only)
- [x] Import content from kolamba.org (tagline, design elements)
- [x] SEO metadata (OpenGraph, Twitter cards, comprehensive meta tags)
- [x] Seeded 50 largest Jewish communities (US + Canada)

### Phase 9: Design Polish ✅
- [x] Import design elements from kolamba.org
- [x] Custom color scheme (coral/teal palette)
- [x] Typography consistency (Open Sans, DM Sans)
- [x] Image optimization (Next.js Image component)
- [x] Loading states and animations (Skeleton components)

---

### Phase 10: Artist Features ✅
- [x] Artist profile editing (self-service via `/me`)
- [x] Media gallery (Cloudinary image/video uploads)
- [x] Portfolio showcase (portfolio images, video URLs, Spotify links)
- [x] Pricing configuration (price_single, price_tour, price tiers)
- [ ] Calendar availability (partial — availability JSON field exists)

### Phase 11: Community Features ✅
- [x] Community dashboard with artist discovery
- [x] Booking management interface
- [x] Communication with artists (conversation system)
- [x] My bookings view with artist names
- [ ] Tour coordination tools (backend exists, frontend pending)

### Phase 12: Admin Panel ✅
- [x] Admin dashboard with stats
- [x] User management (list, update, deactivate)
- [x] Artist moderation (approve/reject with reasons)
- [x] Booking management (status updates)
- [x] Seed data management (superusers, categories, communities, demo data)

### Phase 13: Notifications (Partial)
- [x] Email service via Resend (welcome, booking, status change)
- [x] Contact form with email delivery
- [ ] In-app notifications
- [ ] Tour proposal emails
- [ ] Notification preferences

## Pending Development Phases

### Phase 14: Advanced Features
- [ ] Reviews and ratings
- [ ] Favorite artists
- [ ] Map-based discovery (Leaflet/Mapbox)
- [ ] Full-text search (PostgreSQL tsvector)
- [ ] Geographic search ("artists near me")

### Phase 15: Production Readiness
- [ ] Merge with kolamba.org domain
- [ ] Error monitoring (Sentry)
- [ ] Analytics integration
- [x] Rate limiting ✅
- [x] Structured logging ✅
- [x] CORS configuration ✅

---

## Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key-min-32-chars
CORS_ORIGINS=https://kolamba.vercel.app,https://kolamba.org
ENV=production
DEBUG=false

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Media uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
RESEND_API_KEY=your-resend-api-key
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://kolamba-production.up.railway.app
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with local database credentials
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
npm run dev
```

### Docker (Full Stack)
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:8001 (maps to 8000 inside container)
# API Docs: http://localhost:8001/api/docs
```

---

## Key Algorithms

### Tour Grouping (Haversine Distance)
The system uses the Haversine formula to calculate great-circle distances between communities, enabling intelligent grouping of bookings into tours:

```python
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    φ1, φ2 = radians(lat1), radians(lat2)
    Δφ = radians(lat2 - lat1)
    Δλ = radians(lon2 - lon1)

    a = sin(Δφ/2)**2 + cos(φ1) * cos(φ2) * sin(Δλ/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c
```

**Grouping Logic:**
1. Collect all pending bookings for an artist
2. Calculate pairwise distances between communities
3. Group communities within configurable radius (default: 300km)
4. Propose optimal tour routes

---

## Security Considerations

### Implemented
- [x] Password hashing with bcrypt
- [x] JWT token authentication (access + refresh tokens)
- [x] Google OAuth 2.0 authentication
- [x] CORS configuration (origin whitelist)
- [x] Input validation with Pydantic
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] Rate limiting (slowapi — auth 5/min, search 30/min, booking 10/min, default 60/min)
- [x] Structured audit logging (auth events, admin actions)
- [x] Role-based access control (admin, agent, artist, community)

### Recommended for Production
- [ ] HTTPS enforcement
- [ ] Security headers (CSP, HSTS)
- [ ] Error monitoring (Sentry)

---

## Branding

**Developed by**: Drishti Consulting | 2026

**Footer includes**:
- Drishti logo (concentric circles design)
- Open Sans font family
- "Developed by Drishti | 2026" text

---

## Support & Maintenance

### Logs
- **Railway**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Logs

### Database
- **Migrations**: `alembic upgrade head`
- **Rollback**: `alembic downgrade -1`

### Deployment
- **Backend**: Push to `main` branch → Railway auto-deploys
- **Frontend**: Push to `main` branch → Vercel auto-deploys

---

*Document last updated: February 15, 2026*
