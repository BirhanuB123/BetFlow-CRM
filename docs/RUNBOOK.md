# 🚀 BetFlow Real Estate CRM — Production Operations Runbook

This document provides complete instructions for operating, configuring, scaling, and recovering the BetFlow Real Estate CRM production environment.

---

## 1. System Architecture Overview

BetFlow CRM is architected as an enterprise Turborepo monorepo:

```
├── apps/
│   ├── api/            # NestJS v11 REST & WebSocket Gateway (Port 4000)
│   │   ├── prisma/     # PostgreSQL ORM Models, Migrations & Seeds
│   │   └── src/        # Core, CRM, Finance, Real Estate, Integrations & Platform
│   └── web/            # Next.js 16 (App Router + Turbopack, Port 3000)
├── packages/
│   ├── shared/         # Shared TypeScript DTOs, Enums & Interfaces
│   └── config/         # Shared ESLint, Prettier & TypeScript Configs
└── docker-compose.yml  # Production Multi-Service Container Orchestration
```

---

## 2. Environment Variables & Configuration Matrix

Ensure the following environment variables are securely injected into your production environment:

| Variable | Required | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production optimizations, logging & error masking |
| `PORT` | Yes | `4000` (API), `3000` (Web) | HTTP listener ports |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db?schema=public` | PostgreSQL connection string |
| `DB_POOL_MAX` | No | `20` | Max database connection pool connections |
| `DB_SSL` | No | `true` | Enforce SSL for managed cloud databases (RDS / Supabase / Neon) |
| `JWT_SECRET` | Yes | `>32 chars random string` | Secret used to sign authentication tokens (Must NOT be default) |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifespan |
| `DOCUMENTS_STORAGE_PATH`| No | `./uploads/documents` | Storage location for verified documents & KYC IDs |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.yourdomain.com/api` | API Base URL consumed by Next.js frontend |
| `ADMIN_INVITE_CODE` | No | `BETFLOW-VIP-2026` | Invite code for auto-activating new admin/manager accounts |
| `AFROMESSAGE_API_KEY` | Optional | Bearer Token string | AfroMessage SMS Gateway primary token |
| `ETHIO_TELECOM_API_URL` | Optional| HTTP Gateway URL | Ethio Telecom shortcode failover endpoint |

---

## 3. Deployment with Docker Compose

To deploy the entire stack locally or on a VPS (Ubuntu / Debian / AWS EC2):

```bash
# 1. Clone repository
git clone https://github.com/BirhanuB123/BetFlow-CRM.git
cd BetFlow-CRM

# 2. Configure production environment
cp .env.example .env
# Edit .env and supply secure production credentials (JWT_SECRET, POSTGRES_PASSWORD, etc.)

# 3. Build and launch all services
docker compose up -d --build

# 4. Verify containers are running and healthy
docker compose ps
```

---

## 4. Zero-Downtime Database Migration Procedures

Prisma migrations are deployed automatically on container startup or manually via CLI:

### Running Migrations in Production:
```bash
# Execute pending declarative migrations
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Verify migration status
npx prisma migrate status --schema=apps/api/prisma/schema.prisma
```

### Seeding Initial Real Estate Master Data:
```bash
npm run seed --workspace=apps/api
```

---

## 5. Automated Health Checks & Observability

### Health Check Endpoint:
- **URL**: `GET /api/health`
- **Expected Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-02T02:45:00.000Z",
    "uptime": 1284.5,
    "services": {
      "database": "connected",
      "redis": "ready"
    }
  }
  ```

---

## 6. Backup & Disaster Recovery Procedures

### Automated Database Backup Script:
```bash
#!/bin/bash
# Backup PostgreSQL Database
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/betflow"
mkdir -p $BACKUP_DIR

docker exec betflow_db pg_dump -U betflow -d betflow_db -F c -b -v -f "$BACKUP_DIR/betflow_backup_$TIMESTAMP.dump"

# Keep last 30 days of backups
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -exec rm {} \;
echo "Backup completed: betflow_backup_$TIMESTAMP.dump"
```

### Restoring from Backup:
```bash
# Restore PostgreSQL dump
docker exec -i betflow_db pg_restore -U betflow -d betflow_db -v --clean /var/backups/betflow/betflow_backup_YYYYMMDD_HHMMSS.dump
```

---

## 7. Operational Troubleshooting

| Symptom | Probable Cause | Action |
| :--- | :--- | :--- |
| `502 Bad Gateway` on Web | API service not healthy or listening on wrong port | Check `docker logs betflow_api` and verify `NEXT_PUBLIC_API_URL` |
| `401 Unauthorized` on Auth | `JWT_SECRET` mismatch or token expired | Re-authenticate or verify `JWT_SECRET` in `.env` |
| Concurrency Unit Lock Failed | Two agents reserved the same unit simultaneously | Expected behavior: Unit is locked via `SELECT ... FOR UPDATE` |
| Database Connection Timeout | Connection pool exhausted | Increase `DB_POOL_MAX` or check slow query log |
