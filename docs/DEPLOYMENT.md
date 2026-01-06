# 🚀 Deployment Guide

Panduan deployment Dashboard Uskup Surabaya ke production.

**Last Updated**: 5 Januari 2026  
**Version**: 2.5.0

---

## Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated/pushed
- [ ] Build successful (`npm run build`)
- [ ] Tests passing (`npm test`)
- [ ] Security secrets updated (JWT_SECRET)
- [ ] SSL certificate ready

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT signing (32+ chars) | Random secure string |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `POROROMO_API_URL` | External API for Imam sync | - |
| `POROROMO_API_KEY` | API Key for Pororomo | - |

---

## Deployment Options

### Option 1: Vercel (Recommended ✅)

Paling mudah untuk deployment Next.js.

#### Setup

1. Push code ke GitHub
2. Import project di [Vercel Dashboard](https://vercel.com)
3. Configure environment variables
4. Deploy

#### vercel.json

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "framework": "nextjs"
}
```

#### Database

Gunakan Vercel Postgres atau external PostgreSQL:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

### Option 2: Docker Production

#### Dockerfile (Production)

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

#### docker-compose.prod.yml

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/uskup
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=uskup
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Commands

```bash
# Build dan run
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Stop
docker-compose -f docker-compose.prod.yml down
```

---

### Option 3: VPS / Cloud Server

#### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2

# Install PostgreSQL (optional, if not using external DB)
sudo apt install -y postgresql postgresql-contrib
```

#### 2. Clone & Build

```bash
# Clone repository
git clone https://github.com/your-org/DashboardUskup.git
cd DashboardUskup

# Install dependencies
npm ci --omit=dev

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Setup database
npx prisma generate
npx prisma migrate deploy  # Or: npx prisma db push
npm run db:seed  # Optional: seed initial data

# Build
npm run build
```

#### 3. Run with PM2

```bash
# Start application
pm2 start npm --name "uskup-dashboard" -- start

# Save process list
pm2 save

# Auto-start on reboot
pm2 startup
```

#### 4. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name dashboard.keuskupan-sby.or.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.keuskupan-sby.or.id
```

---

## Database Setup

### PostgreSQL Production Setup

```bash
# Create database
sudo -u postgres psql

CREATE USER uskup_admin WITH PASSWORD 'secure_password';
CREATE DATABASE uskup_dashboard OWNER uskup_admin;
GRANT ALL PRIVILEGES ON DATABASE uskup_dashboard TO uskup_admin;
\q
```

### Migration Commands

```bash
# Development -> Production migration
npx prisma migrate deploy

# Alternative: Direct schema push
npx prisma db push

# Seed initial data (first time only)
npm run db:seed
```

---

## Health Check

### Endpoint

`GET /api/health`

### Expected Response

```json
{
  "status": "ok",
  "timestamp": "2026-01-05T00:00:00.000Z",
  "database": "connected",
  "version": "2.5.0"
}
```

---

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs uskup-dashboard

# Monitor resources
pm2 monit
```

### Docker Monitoring

```bash
# View logs
docker-compose logs -f app

# Stats
docker stats
```

---

## Backup Strategy

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U uskup_admin uskup_dashboard > backup_$(date +%Y%m%d).sql

# Restore
psql -U uskup_admin uskup_dashboard < backup_20260105.sql
```

### Automated Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U uskup_admin uskup_dashboard > /backups/uskup_$(date +\%Y\%m\%d).sql
```

---

## Rollback

### Vercel

1. Go to Deployments tab
2. Find previous deployment
3. Click "Promote to Production"

### PM2 / VPS

```bash
# Git rollback
git log --oneline -5  # Find commit to rollback to
git checkout <commit-hash>

# Rebuild
npm run build
pm2 restart uskup-dashboard
```

---

## Security Checklist

- [ ] JWT_SECRET is unique and secure (32+ chars)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Database credentials not exposed in code
- [ ] CORS configured properly
- [ ] Rate limiting enabled (optional)
- [ ] Input validation on all endpoints
- [ ] Regular security updates
- [ ] Database backup automated

---

## Performance Optimization

### Next.js

- Image optimization enabled
- Static pages cached
- Dynamic imports for large components

### Database

- Indexes on frequently queried fields
- Connection pooling for PostgreSQL

### Server

- Nginx gzip compression enabled
- Static assets cached (max-age)
