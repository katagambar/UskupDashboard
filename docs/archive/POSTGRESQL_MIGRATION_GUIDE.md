# 🐘 Panduan Migrasi PostgreSQL

Step-by-step untuk migrasi Dashboard Uskup dari SQLite ke PostgreSQL.

---

## Step 1: Pilih Metode Instalasi PostgreSQL

Pilih **SATU** dari opsi berikut:

### Opsi A: PostgreSQL Lokal (Windows)

```powershell
# Download installer dari:
# https://www.postgresql.org/download/windows/

# Atau via Chocolatey:
choco install postgresql

# Atau via Winget:
winget install PostgreSQL.PostgreSQL
```

### Opsi B: Docker (Recommended untuk Development)

```powershell
# Pastikan Docker Desktop sudah terinstall
docker run -d \
  --name dashboard-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=dashboard_uskup \
  -p 5432:5432 \
  postgres:15
```

### Opsi C: Cloud PostgreSQL

| Provider     | Free Tier         | Link                 |
| ------------ | ----------------- | -------------------- |
| **Supabase** | 500MB, unlimited  | https://supabase.com |
| **Neon**     | 512MB, auto-sleep | https://neon.tech    |
| **Railway**  | $5 credit         | https://railway.app  |
| **Render**   | 256MB, 90 days    | https://render.com   |

---

## Step 2: Verifikasi PostgreSQL Running

```powershell
# Jika lokal:
psql -U postgres -c "SELECT version();"

# Jika Docker:
docker exec -it dashboard-postgres psql -U postgres -c "SELECT version();"

# Output yang diharapkan:
# PostgreSQL 15.x on ...
```

---

## Step 3: Buat Database

```sql
-- Jalankan di psql atau pgAdmin:
CREATE DATABASE dashboard_uskup;

-- Verifikasi:
\l
```

---

## Step 4: Update .env

Buka file `.env` dan update:

```env
# SEBELUM (SQLite):
DATABASE_URL="file:./dev.db"

# SESUDAH (PostgreSQL):
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/dashboard_uskup"
```

Format connection string:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

---

## Step 5: Switch Prisma Provider

Jalankan script yang sudah disiapkan:

```powershell
cd d:\@workspace\DashboardUskup
npx ts-node scripts/switch-database.ts postgresql
```

**Atau manual edit** `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Ganti dari "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## Step 6: Generate Prisma Client

```powershell
npx prisma generate
```

---

## Step 7: Push Schema ke PostgreSQL

```powershell
npx prisma db push
```

Output yang diharapkan:

```
🚀  Your database is now in sync with your Prisma schema.
```

---

## Step 8: Import Data (Opsional)

Jika ingin memindahkan data dari SQLite:

```powershell
# Data sudah di-export sebelumnya ke folder data-export/
# Jalankan import script:
npx ts-node scripts/import-data.ts
```

---

## Step 9: Restart Development Server

```powershell
# Stop server yang sedang berjalan (Ctrl+C)
# Lalu jalankan lagi:
npx next dev -p 3053
```

---

## Step 10: Verifikasi Migrasi

1. Buka http://localhost:3053
2. Login dengan akun yang ada
3. Cek data agenda, tasks, surat muncul normal

### Tes via Prisma Studio:

```powershell
npx prisma studio
```

Akan membuka browser dengan UI untuk melihat data di PostgreSQL.

---

## 🔧 Troubleshooting

### Error: Connection refused

- Pastikan PostgreSQL service running
- Cek port 5432 tidak diblokir firewall
- Verifikasi password di connection string

### Error: Database does not exist

```powershell
# Buat database manual:
psql -U postgres -c "CREATE DATABASE dashboard_uskup;"
```

### Error: Role does not exist

```powershell
# Buat role:
psql -U postgres -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dashboard_uskup TO myuser;"
```

### Reset dan Mulai Ulang

```powershell
# Hapus database dan buat ulang:
psql -U postgres -c "DROP DATABASE IF EXISTS dashboard_uskup;"
psql -U postgres -c "CREATE DATABASE dashboard_uskup;"
npx prisma db push
```

---

## 📋 Checklist

- [ ] PostgreSQL terinstall dan running
- [ ] Database `dashboard_uskup` dibuat
- [ ] `.env` diupdate dengan connection string
- [ ] `prisma/schema.prisma` provider = postgresql
- [ ] `npx prisma generate` berhasil
- [ ] `npx prisma db push` berhasil
- [ ] Data diimport (jika perlu)
- [ ] Aplikasi berjalan normal
- [ ] Login berhasil
- [ ] Data muncul di dashboard

---

## ⏭️ Next: Deploy ke Production

Setelah PostgreSQL lokal berhasil, langkah selanjutnya:

1. Setup PostgreSQL di cloud (Supabase/Neon/Railway)
2. Update `.env` production dengan connection string cloud
3. Deploy aplikasi ke Vercel/Railway
