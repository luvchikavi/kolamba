# Kolamba - Project Guide

## Architecture

- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (local via Docker or direct)

## Running the Backend

**IMPORTANT**: Port 8000 is occupied by a different project (Nectra/Django). Kolamba backend MUST run on **port 8001**.

```bash
cd /Users/aviluvchik/app/Kolamba/backend
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

- API base: `http://127.0.0.1:8001/api`
- Docs: `http://127.0.0.1:8001/api/docs`
- Health: `http://127.0.0.1:8001/api/health`

Before starting, always check if it's already running:
```bash
lsof -i :8001 | grep LISTEN
```

### Database

- Connection: `postgresql+asyncpg://postgres:password@localhost:5432/kolamba`
- Config: `backend/.env`
- Migrations: `cd backend && alembic upgrade head`
- **Always run migrations before testing** if model changes were made.

## Running the Frontend

```bash
cd /Users/aviluvchik/app/Kolamba/frontend
npm run dev
```

- Runs on: `http://localhost:3000`
- Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` in `frontend/.env.local` if testing against local backend.

## Key Directories

```
backend/
  app/
    main.py          # FastAPI entry point
    routers/         # API endpoints
    models/          # SQLAlchemy ORM models
    schemas/         # Pydantic request/response schemas
    services/        # Business logic
    database.py      # DB connection setup
  alembic/           # DB migrations
  requirements.txt

frontend/
  src/
    app/             # Next.js pages (App Router)
    components/      # React components
    lib/api.ts       # API client + TypeScript types
    hooks/           # React hooks
```

## Testing Endpoints

Use curl against port 8001:
```bash
curl -s "http://127.0.0.1:8001/api/health"
curl -s "http://127.0.0.1:8001/api/communities?limit=3"
curl -s "http://127.0.0.1:8001/api/artists?limit=3"
```

## Port Map (Local Development)

| Port | Service | Project |
|------|---------|---------|
| 3000 | Next.js frontend | Kolamba |
| 5432 | PostgreSQL | Shared |
| 8000 | Django backend | Nectra (NOT Kolamba) |
| 8001 | FastAPI backend | **Kolamba** |

## Common Pitfalls

1. **Port 8000 is NOT Kolamba** — it's a Django project (Nectra). Always use port 8001 for Kolamba backend.
2. **Run migrations first** — after any model change: `cd backend && alembic upgrade head`
3. **TypeScript check**: `cd frontend && npx tsc --noEmit`
4. **Python syntax check**: `python -c "import ast; ast.parse(open('file.py').read())"`
