# Kolamba

**פלטפורמת Marketplace לסיורי אמנים בקהילות יהודיות**

A two-sided marketplace connecting Israeli/Jewish artists with Jewish communities worldwide.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15 (or Docker)

### Option 1: Using Setup Script
```bash
# Clone the repository
git clone https://github.com/kolamba/kolamba.git
cd kolamba

# Run setup script
./scripts/setup-dev.sh

# Start backend (terminal 1)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### Option 2: Using Docker
```bash
# Clone and start with Docker Compose
git clone https://github.com/kolamba/kolamba.git
cd kolamba
docker-compose up
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## Project Structure

```
kolamba/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── utils/     # Utilities
│   └── alembic/       # Database migrations
├── frontend/          # Next.js application
│   └── src/
│       ├── app/       # App router pages
│       ├── components/# React components
│       ├── lib/       # Utilities
│       └── types/     # TypeScript types
├── docs/              # Documentation
├── scripts/           # Deployment scripts
└── docker-compose.yml
```

## Documentation

- [Architecture Document](./docs/ARCHITECTURE.md) - Full technical specification
- [Project Plan](./docs/PROJECT-PLAN.md) - Timeline and deliverables
- API Documentation - (auto-generated at `/api/docs`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11 + FastAPI |
| Frontend | Next.js 14 + TypeScript |
| Database | PostgreSQL 15 |
| Hosting | Railway |
| CDN | Cloudflare |

## MVP Features

- Homepage with artist search
- Artist profiles (bio, categories, pricing, availability)
- Community profiles (name, location, audience size)
- Advanced search (category, price, language, region, dates)
- Booking request flow
- Tour suggestion algorithm

## Project Info

| Attribute | Value |
|-----------|-------|
| Proposal | PP-KOL-002-26 v2.0 |
| Duration | 4 weeks |
| Client | Kolamba בע"מ |

## IP & Ownership

All code, logic, design, and materials developed for this project are the exclusive property of **Kolamba בע"מ**.

---

**Developed by:** Drishti Consulting
**Date:** January 2026
