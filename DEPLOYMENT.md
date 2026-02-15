# Kolamba Deployment Guide

## Overview

Kolamba is a two-sided marketplace connecting Israeli/Jewish artists with Jewish communities worldwide.

## Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy 2.0 (async), PostgreSQL
- **Deployment**: Docker, Nginx reverse proxy

## Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8001
# - API Docs: http://localhost:8001/api/docs
```

### Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server (port 8001 — port 8000 is reserved)
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Production Deployment

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=kolamba
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Backend
SECRET_KEY=your-very-secure-secret-key-minimum-32-chars
CORS_ORIGINS=https://kolamba.com,https://www.kolamba.com
RESEND_API_KEY=your-resend-api-key

# Frontend
NEXT_PUBLIC_API_URL=https://api.kolamba.com
```

### SSL Certificates

Place your SSL certificates in `nginx/ssl/`:
- `fullchain.pem` - Certificate chain
- `privkey.pem` - Private key

For Let's Encrypt:
```bash
certbot certonly --standalone -d kolamba.com -d www.kolamba.com -d api.kolamba.com
```

### Deploy with Docker

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Railway Deployment (Current Production)

1. Connect your GitHub repository to Railway
2. Create a PostgreSQL database service
3. Set environment variables in Railway dashboard:
   - `DATABASE_URL` — Railway-provided PostgreSQL URL
   - `SECRET_KEY` — min 32 chars
   - `CORS_ORIGINS` — comma-separated allowed origins
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — image uploads
   - `RESEND_API_KEY` — transactional emails
4. Backend auto-deploys from `main` branch via `railway.toml`

### Vercel Deployment (Frontend)

1. Import the repository in Vercel dashboard
2. Set root directory to `frontend`
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://kolamba-production.up.railway.app`
4. Auto-deploys from `main` branch

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## API Documentation

- Swagger UI: `http://localhost:8001/api/docs`
- ReDoc: `http://localhost:8001/api/redoc`
- OpenAPI JSON: `http://localhost:8001/api/openapi.json`

## Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/artists` | List artists |
| `GET /api/artists/{id}` | Get artist details |
| `GET /api/categories` | List categories |
| `POST /api/bookings` | Create booking |
| `GET /api/tours/suggestions/{artist_id}` | Get tour suggestions |
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/admin/stats` | Admin dashboard stats |
| `GET /api/agents/me/artists` | Agent artist roster |

**Total: 83 API endpoints** across 12 routers. See full list at `/api/docs`.

## Monitoring

### Health Check
```bash
curl http://localhost:8001/api/health
```

### Docker Container Status
```bash
docker-compose ps
```

### Logs (Railway)
- Railway Dashboard → Service → Logs tab
- Backend has structured logging: request method, path, status, duration

### Logs (Vercel)
- Vercel Dashboard → Deployments → View Logs

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### CORS Errors
- Update CORS_ORIGINS in backend .env
- Restart backend service

### Build Failures
- Clear `.next` folder and node_modules
- Run `npm ci` for clean install

## Support

Developed by Drishti Consulting | 2026
