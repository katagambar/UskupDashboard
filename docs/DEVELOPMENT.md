# 🛠️ Development Guide

Panduan pengembangan untuk Dashboard Uskup Surabaya.

**Last Updated**: 5 Januari 2026

---

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Docker (optional, untuk containerized development)

---

## Quick Start

### Option 1: Local Development (Recommended ✅)

Direkomendasikan untuk Windows karena lebih cepat dan stabil.

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Setup database dengan seed data
npm run db:setup

# 4. Start development server
npm run dev:local
```

Access at: **<http://localhost:3000>**

### Option 2: Docker Development

```bash
# Start dengan Docker
npm run docker:dev
```

Access at: **<http://localhost:3040>**

> ⚠️ **Note**: Docker pada Windows mungkin mengalami masalah memory dan HMR lambat. Gunakan Option 1 untuk pengembangan yang lebih cepat.

---

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ke database |
| `npm run db:seed` | Seed database dengan sample data |
| `npm run db:fresh` | Reset database dan re-seed |
| `npm run db:setup` | Push schema + seed (untuk setup baru) |
| `npm run db:migrate` | Run migrations |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| USKUP | <uskup@keuskupan-sby.or.id> | UskupSBY2025! |
| SEKRETARIS | <sekretaris@keuskupan-sby.or.id> | UskupSBY2025! |
| VIKJEN | <vikjen@keuskupan-sby.or.id> | UskupSBY2025! |
| VIKYUD | <vikyud@keuskupan-sby.or.id> | UskupSBY2025! |
| EKONOM | <ekonom@keuskupan-sby.or.id> | UskupSBY2025! |

---

## NPM Scripts

### Development

| Script | Description |
|--------|-------------|
| `npm run dev:local` | Start Next.js dev server (port 3000) |
| `npm run docker:dev` | Start Docker development |
| `npm run docker:clean` | Clean rebuild Docker |
| `npm run docker:stop` | Stop Docker containers |

### Production

| Script | Description |
|--------|-------------|
| `npm run build` | Build untuk production |
| `npm run start` | Start production server |
| `npm run setup:production` | Generate + Push + Seed |

### Testing

| Script | Description |
|--------|-------------|
| `npm test` | Run tests dengan Vitest |
| `npm run test:ui` | Run tests dengan UI |
| `npm run test:coverage` | Run tests dengan coverage |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   ├── agenda/           # Agenda page
│   ├── tasks/            # Tasks page
│   └── ...
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-*.tsx   # Dashboard components
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── rbac.ts           # Role-based access control
│   ├── indonesian-holidays.ts  # Indonesian holidays data
│   └── ...
└── styles/               # CSS files
```

---

## Troubleshooting

### HMR Not Working (Docker)

```bash
# Restart Docker dengan port baru
docker-compose down
docker-compose up --build

# Atau gunakan npm run dev:local
```

### Docker Memory Issues

```bash
# Gunakan local development sebagai alternatif
npm run dev:local
```

### Prisma Type Errors

```bash
npm run db:generate
```

### Database Corrupted

```bash
npm run db:fresh
```

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Atau gunakan port lain
npm run dev:local -- -p 3001
```

---

## Code Style

- **ESLint**: `npm run lint`
- **TypeScript**: Strict mode enabled
- **Components**: Functional components dengan hooks
- **Styling**: TailwindCSS utility classes

---

## Environment Variables

### Development (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Production

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="production-secret-key-32-chars-min"
NODE_ENV="production"
```
