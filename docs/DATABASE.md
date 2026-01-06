# 🗄️ Database Documentation

## Overview

Dashboard Uskup Surabaya menggunakan Prisma ORM dengan SQLite untuk development dan PostgreSQL untuk production.

## Schema Models

### User

Model untuk pengguna sistem.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  passwordSet   Boolean   @default(false)
  role          String    @default("staff")
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  agendas       Agenda[]
  tasks         Task[]
  notulensi     Notulensi[]
  surat         Surat[]
  decisions     Decision[]
  notifications Notification[]
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (CUID) |
| email | String | Email unik untuk login |
| name | String? | Nama pengguna |
| password | String | Password ter-hash (bcrypt) |
| passwordSet | Boolean | Apakah password sudah diset |
| role | String | Role: "bishop", "staff", "admin" |

### Agenda

Model untuk jadwal pertemuan.

```prisma
model Agenda {
  id              String   @id @default(cuid())
  judul           String
  tanggal         String
  waktu           String
  lokasi          String
  jenis           String
  peserta         String
  deskripsi       String?
  status          String   @default("Dijadwalkan")
  googleCalendarId String?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  creator         User     @relation(fields: [createdBy], references: [id])
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| judul | String | Judul agenda |
| tanggal | String | Tanggal dalam format YYYY-MM-DD |
| waktu | String | Waktu dalam format HH:mm |
| lokasi | String | Lokasi pertemuan |
| jenis | String | Jenis: "Kuria", "Pastoral", "Komisi", "Lainnya" |
| peserta | String | Daftar peserta |
| status | String | Status: "Dijadwalkan", "Selesai", "Dibatalkan" |

### Task

Model untuk tugas-tugas.

```prisma
model Task {
  id              String    @id @default(cuid())
  judul           String
  deskripsi       String
  prioritas       String
  status          String    @default("Menunggu")
  progress        Int       @default(0)
  deadline        String
  kategori        String
  penanggungJawab String
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?
  
  creator         User      @relation(fields: [createdBy], references: [id])
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| judul | String | Judul tugas |
| prioritas | String | "Tinggi", "Sedang", "Rendah" |
| status | String | "Menunggu", "Dalam Proses", "Selesai", "Terlambat" |
| progress | Int | Progress 0-100% |
| deadline | String | Tanggal deadline |
| kategori | String | Kategori tugas |

### Notulensi

Model untuk catatan rapat.

```prisma
model Notulensi {
  id              String   @id @default(cuid())
  judul           String
  tanggal         String
  jenis           String
  peserta         String
  isi             String
  kesimpulan      String?
  status          String   @default("Draft")
  approvedBy      String?
  approvedAt      DateTime?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  creator         User     @relation(fields: [createdBy], references: [id])
}
```

### Surat

Model untuk surat menyurat.

```prisma
model Surat {
  id          String   @id @default(cuid())
  nomor       String   @unique
  jenis       String
  judul       String
  pengirim    String
  penerima    String
  tanggal     String
  isi         String?
  prioritas   String   @default("Normal")
  status      String   @default("Menunggu")
  lampiran    String?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  creator     User     @relation(fields: [createdBy], references: [id])
}
```

### Imam

Model untuk database imam.

```prisma
model Imam {
  id              String   @id @default(cuid())
  nama            String
  paroki          String
  jabatan         String
  tanggalTahbisan String
  nomorTelepon    String?
  email           String?
  alamat          String?
  status          String   @default("Aktif")
  foto            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Decision

Model untuk keputusan keuskupan.

```prisma
model Decision {
  id              String   @id @default(cuid())
  judul           String
  deskripsi       String
  targetDate      String
  kategori        String
  penanggungJawab String
  status          String   @default("Dalam Perencanaan")
  progress        Int      @default(0)
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  creator         User     @relation(fields: [createdBy], references: [id])
}
```

### Notification

Model untuk notifikasi sistem.

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  judul     String
  pesan     String
  jenis     String
  dibaca    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

### MasterParameter

Model untuk manajemen parameter dropdown dinamis.

```prisma
model MasterParameter {
  id        String   @id @default(cuid())
  tipe      String   // PRIORITAS, KATEGORI_TUGAS, JENIS_SURAT, JENIS_PERTEMUAN, etc.
  kode      String   // Unique code within type
  nama      String   // Display name
  warna     String?  // Optional color for visual distinction
  urutan    Int      @default(0)
  aktif     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tipe, kode])
  @@index([tipe])
  @@index([tipe, aktif])
}
```

**Parameter Types:**

| Type | Description | Example Values |
|------|-------------|----------------|
| PRIORITAS | Task priority levels | Tinggi, Sedang, Rendah |
| KATEGORI_TUGAS | Task categories | Liturgi, Pastoral, Administratif |
| JENIS_SURAT | Letter types | Edaran, Keputusan, Pernyataan |
| JENIS_PERTEMUAN | Meeting types | Kuria, Pastoral, Komisi |
| JENIS_NOTULENSI | Notes types | Rapat, Pertemuan, Konferensi |
| PERIODE_LAPORAN | Report periods | Mingguan, Bulanan, Tahunan |
| KATEGORI_ISU | Issue categories | Liturgi, Pastoral, Keuangan |
| STATUS_TUGAS | Task statuses | Menunggu, Dalam Proses, Selesai |

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │──┐
│ email       │  │
│ name        │  │
│ password    │  │
│ role        │  │
└─────────────┘  │
                 │
    ┌────────────┼────────────┬────────────┬────────────┐
    │            │            │            │            │
    ▼            ▼            ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│ Agenda  │ │  Task   │ │Notulensi │ │  Surat  │ │ Decision │
├─────────┤ ├─────────┤ ├──────────┤ ├─────────┤ ├──────────┤
│ judul   │ │ judul   │ │ judul    │ │ nomor   │ │ judul    │
│ tanggal │ │ deadline│ │ tanggal  │ │ judul   │ │ targetDt │
│ lokasi  │ │ progress│ │ isi      │ │ pengirim│ │ progress │
│ jenis   │ │ status  │ │ status   │ │ status  │ │ status   │
└─────────┘ └─────────┘ └──────────┘ └─────────┘ └──────────┘

┌─────────────┐  ┌─────────────────┐
│    Imam     │  │ MasterParameter │ (Standalone)
├─────────────┤  ├─────────────────┤
│ nama        │  │ tipe            │
│ paroki      │  │ kode            │
│ jabatan     │  │ nama            │
│ status      │  │ warna           │
└─────────────┘  │ aktif           │
                 └─────────────────┘
```

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Seed database with sample data
npm run db:seed

# Reset database
npx prisma db push --force-reset

# Open Prisma Studio (GUI)
npx prisma studio

# Create migration (production)
npx prisma migrate dev --name migration_name
```

## Sample Data

Setelah seeding, database akan berisi:

| Model | Count | Description |
|-------|-------|-------------|
| User | 4 | Demo users (Uskup, Sekretaris, Vikjen, Staff) |
| Agenda | 5 | Sample agenda pertemuan |
| Task | 5 | Sample tugas dengan berbagai status |
| Notulensi | 3 | Sample notulensi rapat |
| Decision | 3 | Sample keputusan keuskupan |
| Imam | 10 | Sample data imam |
| MasterParameter | 35 | Parameter dropdown values (8 types) |
