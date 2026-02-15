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

# Start backend (terminal 1) — port 8001 (8000 is reserved)
cd backend && source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

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
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/api/docs

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
- [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) - Endpoints, schema, deployment
- [Deployment Guide](./DEPLOYMENT.md) - Local dev & production setup
- [Project Plan](./docs/PROJECT-PLAN.md) - Timeline and deliverables
- [Local Dev Guide](./CLAUDE.md) - Port map and quick dev setup
- API Documentation - auto-generated at `/api/docs`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11 + FastAPI |
| Frontend | Next.js 14 + TypeScript |
| Database | PostgreSQL 15 |
| Backend Hosting | Railway |
| Frontend Hosting | Vercel |
| Image CDN | Cloudinary |

## Features

- Homepage with artist search and categories
- Artist profiles (bio, categories, pricing, portfolio, media)
- Community profiles (type, location, event types)
- Advanced search (category, price, language)
- Booking request flow with conversation system
- Tour suggestion algorithm (Haversine geographic clustering)
- Admin dashboard (user/artist/booking management)
- Agent dashboard (artist roster management)
- Google OAuth authentication
- Cloudinary image/video uploads
- Rate limiting and structured logging
- 83 API endpoints across 12 routers

## Project Info

| Attribute | Value |
|-----------|-------|
| Proposal | PP-KOL-002-26 v2.0 |
| Duration | 4 weeks |
| Client | Kolamba בע"מ |

## IP & Ownership

All code, logic, design, and materials developed for this project are the exclusive property of **Kolamba בע"מ**.

---

**Developed by:** Drishti Consulting @ Avi Luvchik
**Date:** January 2026
