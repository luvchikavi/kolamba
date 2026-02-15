# Kolamba Operations Runbook

## 1. Rotating Secrets

### SECRET_KEY (JWT signing)
1. Generate new key: `python -c "import secrets; print(secrets.token_urlsafe(48))"`
2. Update in Railway dashboard: Service → Variables → `SECRET_KEY`
3. Railway auto-redeploys. All existing JWT tokens will be invalidated (users must re-login).

### GOOGLE_CLIENT_SECRET
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Edit the OAuth 2.0 Client → Regenerate secret
3. Update in Railway: `GOOGLE_CLIENT_SECRET`
4. Update in local `backend/.env`

### CLOUDINARY_API_SECRET
1. Go to [Cloudinary Console](https://cloudinary.com/console) → Settings → Access Keys
2. Regenerate the API secret
3. Update in Railway: `CLOUDINARY_API_SECRET`
4. Update in local `backend/.env`

### Database Password (Railway)
1. Railway dashboard → Database service → Variables → Reset password
2. Update `DATABASE_URL` in backend service variables with new password
3. Service will auto-redeploy

---

## 2. Database Migrations

### Apply migrations
```bash
cd backend
alembic upgrade head
```

### Create a new migration (after model changes)
```bash
cd backend
alembic revision --autogenerate -m "description of change"
alembic upgrade head  # apply locally
```

### Rollback one migration
```bash
cd backend
alembic downgrade -1
```

### Check current migration state
```bash
cd backend
alembic current
alembic history --verbose -r -3:  # last 3 migrations
```

### Production (Railway)
Migrations run automatically via `start.sh` on deploy:
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

---

## 3. Backup & Restore

### Local backup
```bash
cd backend
./scripts/backup-db.sh
# Saves to: backend/backups/local_YYYYMMDD_HHMMSS.sql.gz
```

### Railway (production) backup
```bash
cd backend
export DATABASE_URL="postgresql://..."  # from Railway dashboard
./scripts/backup-db.sh --railway
# Saves to: backend/backups/railway_YYYYMMDD_HHMMSS.sql.gz
```

### Restore from backup
```bash
# Local
./scripts/restore-db.sh backend/backups/local_20260215_120000.sql.gz

# Railway (WARNING: destructive)
export DATABASE_URL="postgresql://..."
./scripts/restore-db.sh --railway backend/backups/railway_20260215_120000.sql.gz
```

Backups auto-rotate: only the last 10 per type (local/railway) are kept.

---

## 4. Rollback a Deployment

### Backend (Railway)
1. Railway dashboard → Service → Deployments tab
2. Click the previous successful deployment → "Redeploy"
3. Or revert the git commit and push:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Frontend (Vercel)
1. Vercel dashboard → Deployments
2. Click the previous deployment → "..." → "Promote to Production"
3. Or revert and push (same as backend)

### Database rollback (if migration failed)
```bash
cd backend
alembic downgrade -1  # roll back one migration
```

---

## 5. Monitoring & Health

### Health check
```bash
# Local
curl -s http://127.0.0.1:8001/api/health | python -m json.tool

# Production
curl -s https://kolamba-production.up.railway.app/api/health | python -m json.tool
```

Expected: `{"status": "healthy"}`

### Backend logs
- **Railway**: Dashboard → Service → Logs tab (real-time streaming)
- **Local**: stdout from `uvicorn` process
- Structured logging format: `YYYY-MM-DD HH:MM:SS LEVEL [logger] message`
- Key loggers: `kolamba` (requests), `kolamba.auth` (auth events), `kolamba.admin` (admin actions)

### Frontend logs
- **Vercel**: Dashboard → Deployments → Function Logs
- **Local**: Next.js dev server console

### Database monitoring
```bash
# Check connection
pg_isready -U postgres -d kolamba

# Active connections
psql -U postgres kolamba -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'kolamba';"
```

### Common issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| 502 on Railway | Backend crashed or OOM | Check Railway logs, increase resources |
| CORS errors | Frontend URL not in CORS_ORIGINS | Update `CORS_ORIGINS` env var |
| Auth failures | SECRET_KEY rotated or expired | Check Railway env vars |
| Upload failures | Cloudinary misconfigured | Check CLOUDINARY_* env vars |
| Email not sending | RESEND_API_KEY missing | Set in Railway env vars |

---

## Port Map (Local Development)

| Port | Service | Project |
|------|---------|---------|
| 3000 | Next.js frontend | Kolamba |
| 5432 | PostgreSQL | Shared |
| 8000 | Django backend | Nectra (NOT Kolamba) |
| 8001 | FastAPI backend | **Kolamba** |

---

*Last updated: February 15, 2026*
