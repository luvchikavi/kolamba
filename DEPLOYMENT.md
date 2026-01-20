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
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
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

# Start server
uvicorn app.main:app --reload
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

### Railway Deployment (Alternative)

1. Connect your GitHub repository to Railway
2. Create a PostgreSQL database
3. Set environment variables in Railway dashboard
4. Deploy backend and frontend as separate services

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

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/artists` | List artists |
| `GET /api/v1/artists/{id}` | Get artist details |
| `GET /api/v1/categories` | List categories |
| `POST /api/v1/bookings` | Create booking |
| `GET /api/v1/tours/suggestions` | Get tour suggestions |
| `POST /api/v1/auth/login` | User login |
| `POST /api/v1/auth/register` | User registration |

## Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Docker Container Status
```bash
docker-compose ps
```

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
