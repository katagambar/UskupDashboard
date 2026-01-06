# 📚 API Documentation

## Dashboard Uskup Surabaya API Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require authentication via NextAuth.js session cookie.

### Standard Response Format

#### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "requestId": "req_1234567890_1",
  "timestamp": "2025-11-09T03:15:10.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for field 'judul': Field is required",
    "details": {
      "field": "judul",
      "value": null,
      "expected": "Valid input"
    },
    "timestamp": "2025-11-09T03:15:10.000Z",
    "requestId": "req_1234567890_1"
  },
  "data": null
}
```

---

## 📅 Agenda API

### GET /api/agenda

Get all agenda items with optional filtering.

**Query Parameters:**

- `jenis` (string): Filter by jenis (Kuria, Pastoral, Komisi, or "semua")
- `status` (string): Filter by status (Dijadwalkan, Selesai, or "semua")
- `search` (string): Search in judul, lokasi, deskripsi

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "agenda_123",
      "judul": "Rapat Kuria Bulanan",
      "tanggal": "2025-11-15",
      "waktu": "09:00",
      "lokasi": "Gedung Keuskupan",
      "jenis": "Kuria",
      "peserta": "Uskup dan Vikaris",
      "deskripsi": "Rapat rutin bulanan",
      "status": "Dijadwalkan",
      "createdAt": "2025-11-09T03:15:10.000Z",
      "updatedAt": "2025-11-09T03:15:10.000Z",
      "creator": {
        "name": "Mgr. Agustinus Tri Budi Utomo",
        "email": "uskup@keuskupan-surabaya.org"
      }
    }
  ]
}
```

### POST /api/agenda

Create a new agenda item.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "judul": "Rapat Kuria Bulanan",
  "tanggal": "2025-11-15",
  "waktu": "09:00",
  "lokasi": "Gedung Keuskupan",
  "jenis": "Kuria",
  "peserta": "Uskup dan Vikaris",
  "deskripsi": "Rapat rutin bulanan"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    // ... agenda object
  },
  "message": "Agenda created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Database error

---

## ✅ Tasks API

### GET /api/tasks

Get all tasks with optional filtering.

**Query Parameters:**

- `status` (string): Filter by status (Menunggu, Dalam Proses, Selesai, Terlambat, or "semua")
- `prioritas` (string): Filter by prioritas (Tinggi, Sedang, Rendah, or "semua")
- `kategori` (string): Filter by kategori (Pastoral, Keuangan, Pembangunan, etc.)
- `search` (string): Search in judul, deskripsi

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "judul": "Persiapan Natal",
      "deskripsi": "Mengatur acara Natal anak-anak",
      "prioritas": "Tinggi",
      "status": "Dalam Proses",
      "progress": 75,
      "deadline": "2025-12-20",
      "kategori": "Pastoral",
      "penanggungJawab": "Pastor Mario",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-09T03:15:10.000Z",
      "completedAt": null,
      "creator": {
        "name": "Mgr. Agustinus Tri Budi Utomo",
        "email": "uskup@keuskupan-surabaya.org"
      }
    }
  ]
}
```

### POST /api/tasks

Create a new task.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "judul": "Persiapan Natal",
  "deskripsi": "Mengatur acara Natal anak-anak",
  "prioritas": "Tinggi",
  "deadline": "2025-12-20",
  "kategori": "Pastoral",
  "penanggungJawab": "Pastor Mario"
}
```

**Response:** `201 Created`

### GET /api/tasks/[id]

Get a specific task by ID.

**Response:** `200 OK`

### PUT /api/tasks/[id]

Update a specific task.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "status": "Selesai",
  "progress": 100
}
```

**Response:** `200 OK`

### DELETE /api/tasks/[id]

Delete a specific task.

**Response:** `204 No Content`

---

## 📄 Notulensi API

### GET /api/notulensi

Get all notulensi with optional filtering.

**Query Parameters:**

- `status` (string): Filter by status (Draft, Menunggu Approve, Disetujui, or "semua")
- `jenis` (string): Filter by jenis (Kuria, Pastoral, Komisi)
- `search` (string): Search in judul, kesimpulan

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "notulensi_123",
      "judul": "Rapat Kuria 15 November",
      "tanggal": "2025-11-15",
      "jenis": "Kuria",
      "peserta": "Uskup, Vikaris Umum, Vikaris Pastoral",
      "status": "Draft",
      "isi": "Isi notulensi...",
      "kesimpulan": "Kesimpulan rapat...",
      "lampiran": null,
      "createdAt": "2025-11-15T12:00:00.000Z",
      "updatedAt": "2025-11-15T12:00:00.000Z",
      "approvedAt": null,
      "approvedBy": null,
      "creator": {
        "name": "Mgr. Yohanes Harun Yuwono"
      },
      "agenda": {
        "id": "agenda_123",
        "judul": "Rapat Kuria Bulanan"
      }
    }
  ]
}
```

### POST /api/notulensi

Create a new notulensi.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "judul": "Rapat Kuria 15 November",
  "tanggal": "2025-11-15",
  "jenis": "Kuria",
  "peserta": "Uskup, Vikaris Umum, Vikaris Pastoral",
  "isi": "Isi notulensi...",
  "kesimpulan": "Kesimpulan rapat...",
  "agendaId": "agenda_123"
}
```

**Response:** `201 Created`

---

## 📮 Surat API

### GET /api/surat

Get all surat with optional filtering.

**Query Parameters:**

- `jenis` (string): Filter by jenis (Masuk, Keluar, Edaran)
- `status` (string): Filter by status (Menunggu, Diproses, Selesai)
- `prioritas` (string): Filter by prioritas (Normal, Tinggi, Segera)
- `search` (string): Search in nomor, judul

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "surat_123",
      "nomor": "SK/2025/001",
      "jenis": "Keluar",
      "judul": "Surat Undangan Natal",
      "pengirim": "Keuskupan Surabaya",
      "penerima": "Paroki Se-Keuskupan",
      "tanggal": "2025-11-20",
      "isi": "Isi surat...",
      "lampiran": null,
      "status": "Menunggu",
      "prioritas": "Normal",
      "createdAt": "2025-11-09T03:15:10.000Z",
      "updatedAt": "2025-11-09T03:15:10.000Z",
      "creator": {
        "name": "Mgr. Yohanes Harun Yuwono"
      }
    }
  ]
}
```

### POST /api/surat

Create a new surat.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "nomor": "SK/2025/001",
  "jenis": "Keluar",
  "judul": "Surat Undangan Natal",
  "pengirim": "Keuskupan Surabaya",
  "penerima": "Paroki Se-Keuskupan",
  "tanggal": "2025-11-20",
  "isi": "Isi surat...",
  "prioritas": "Normal"
}
```

**Response:** `201 Created`

---

## 🏛️ Decisions API

### GET /api/decisions

Get all decisions with optional filtering.

**Query Parameters:**

- `status` (string): Filter by status (Dalam Perencanaan, Dalam Proses, Selesai, Tertunda)
- `kategori` (string): Filter by kategori (Pembangunan, Pastoral, Keuangan, SDM)
- `search` (string): Search in judul, deskripsi

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "decision_123",
      "judul": "Pembangunan Gereja Baru",
      "deskripsi": "Rencana pembangunan gereja di wilayah utara",
      "status": "Dalam Proses",
      "progress": 45,
      "targetDate": "2026-06-30",
      "kategori": "Pembangunan",
      "penanggungJawab": "Pastor Anton",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-11-09T03:15:10.000Z",
      "completedAt": null,
      "creator": {
        "name": "Mgr. Yohanes Harun Yuwono"
      }
    }
  ]
}
```

### POST /api/decisions

Create a new decision.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "judul": "Pembangunan Gereja Baru",
  "deskripsi": "Rencana pembangunan gereja di wilayah utara",
  "status": "Dalam Perencanaan",
  "targetDate": "2026-06-30",
  "kategori": "Pembangunan",
  "penanggungJawab": "Pastor Anton"
}
```

**Response:** `201 Created`

---

## 👨‍💼 Imam API

### GET /api/imam

Get all imam with optional filtering.

**Query Parameters:**

- `status` (string): Filter by status (Aktif, Cuti, Pensiun)
- `paroki` (string): Filter by paroki
- `search` (string): Search in nama, paroki

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "imam_123",
      "nama": "Pastor Mario Rossi",
      "paroki": "Gereja Santa Maria",
      "jabatan": "Pastor Paroki",
      "status": "Aktif",
      "tanggalTahbisan": "2005-06-15",
      "nomorTelepon": "+628123456789",
      "email": "mario@keuskupan-surabaya.org",
      "alamat": "Jl. Gereja No. 123, Surabaya",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-11-09T03:15:10.000Z"
    }
  ]
}
```

### POST /api/imam

Create a new imam record.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "nama": "Pastor Mario Rossi",
  "paroki": "Gereja Santa Maria",
  "jabatan": "Pastor Paroki",
  "status": "Aktif",
  "tanggalTahbisan": "2005-06-15",
  "nomorTelepon": "+628123456789",
  "email": "mario@keuskupan-surabaya.org",
  "alamat": "Jl. Gereja No. 123, Surabaya"
}
```

**Response:** `201 Created`

---

## ⚙️ Master Parameter API

Manage dynamic dropdown values used across the application.

### GET /api/master/parameter

Get parameters with optional filtering.

**Query Parameters:**

- `tipe` (string): Filter by parameter type (PRIORITAS, KATEGORI_TUGAS, JENIS_SURAT, etc.)
- `aktif` (string): Filter by active status ("true" or "false", default: "true")

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "param_123",
      "tipe": "PRIORITAS",
      "kode": "TINGGI",
      "nama": "Tinggi",
      "warna": "#EF4444",
      "urutan": 1,
      "aktif": true,
      "createdAt": "2025-01-04T10:00:00.000Z",
      "updatedAt": "2025-01-04T10:00:00.000Z"
    }
  ]
}
```

### POST /api/master/parameter

Create a new parameter.

**Headers:** `Content-Type: application/json`
**Permissions:** USKUP, SEKRETARIS, VIKJEN only

**Body:**

```json
{
  "tipe": "PRIORITAS",
  "kode": "SANGAT_TINGGI",
  "nama": "Sangat Tinggi",
  "warna": "#DC2626",
  "urutan": 0
}
```

**Response:** `201 Created`

### PATCH /api/master/parameter/[id]

Update an existing parameter.

**Headers:** `Content-Type: application/json`
**Permissions:** USKUP, SEKRETARIS, VIKJEN only

**Body:**

```json
{
  "nama": "Updated Name",
  "warna": "#3B82F6",
  "urutan": 2,
  "aktif": false
}
```

**Response:** `200 OK`

### DELETE /api/master/parameter/[id]

Delete a parameter.

**Permissions:** USKUP, SEKRETARIS, VIKJEN only

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Parameter deleted"
}
```

**Supported Parameter Types:**

- `PRIORITAS` - Task priority levels
- `KATEGORI_TUGAS` - Task categories
- `JENIS_SURAT` - Letter types
- `JENIS_PERTEMUAN` - Meeting types
- `JENIS_NOTULENSI` - Notes types
- `PERIODE_LAPORAN` - Report periods
- `KATEGORI_ISU` - Issue categories
- `STATUS_TUGAS` - Task statuses

---

## 📊 Dashboard API

### GET /api/dashboard

Get aggregated dashboard data with caching.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "summary": {
      "agendaToday": 3,
      "tasksActive": 12,
      "notulensiMonth": 8,
      "imamAktif": 25,
      "decisionsActive": 5
    },
    "recentAgenda": [
      {
        "id": "agenda_123",
        "judul": "Rapat Kuria",
        "tanggal": "2025-11-15",
        "jenis": "Kuria",
        "creatorName": "Mgr. Agustinus Tri Budi Utomo"
      }
    ],
    "urgentTasks": [
      {
        "id": "task_123",
        "judul": "Persiapan Natal",
        "prioritas": "Tinggi",
        "status": "Dalam Proses",
        "creatorName": "Mgr. Agustinus Tri Budi Utomo"
      }
    ],
    "pendingNotulensi": [
      {
        "id": "notulensi_123",
        "judul": "Rapat Kuria",
        "status": "Draft",
        "creatorName": "Mgr. Agustinus Tri Budi Utomo"
      }
    ],
    "lastUpdated": "2025-11-09T03:15:10.000Z"
  }
}
```

**Caching:** Response is cached for 5 minutes to improve performance.

---

## 🔐 Authentication API

### POST /api/auth/password

Password management endpoints.

#### GET /api/auth/password/status

Get password status for current user.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "hasPassword": true,
    "passwordSet": true,
    "lastUpdated": "2025-11-09T03:15:10.000Z"
  }
}
```

#### POST /api/auth/password

Set or update password for current user.

**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "currentPassword": "oldPassword123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Generate secure password

Generate a cryptographically secure random password.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "password": "K9#mP2$vL8!nR4",
    "strength": "strong"
  }
}
```

---

## 🔄 Socket.IO Real-time API

### Connection

**URL:** `ws://localhost:3000/api/socketio`
**Protocol:** WebSocket with Socket.IO

### Events

#### Client → Server Events

**`user:identify`**
Identify the connected user.

```json
{
  "id": "user_123",
  "name": "Mgr. Agustinus Tri Budi Utomo",
  "role": "bishop"
}
```

**`notification:send`**
Send a notification to users.

```json
{
  "type": "info",
  "title": "New Agenda",
  "message": "A new agenda has been created",
  "targetUsers": ["user_456"]
}
```

**`data:update`**
Notify about data changes.

```json
{
  "type": "agenda",
  "action": "create",
  "recordId": "agenda_123",
  "data": { /* agenda data */ }
}
```

**`dashboard:refresh`**
Request dashboard refresh.

```json
{
  "userId": "user_123"
}
```

#### Server → Client Events

**`connection:established`**
Sent when connection is established.

```json
{
  "message": "Welcome to Dashboard Uskup Surabaya Real-time System!",
  "socketId": "socket_123",
  "timestamp": "2025-11-09T03:15:10.000Z",
  "features": [
    "Real-time notifications",
    "Live data updates"
  ]
}
```

**`user:joined`** / **`user:left`**
User connection status updates.

```json
{
  "user": {
    "id": "user_123",
    "name": "Mgr. Agustinus Tri Budi Utomo",
    "role": "bishop"
  },
  "timestamp": "2025-11-09T03:15:10.000Z"
}
```

**`notification:receive`**
Receive a notification.

```json
{
  "type": "info",
  "title": "New Agenda",
  "message": "A new agenda has been created",
  "timestamp": "2025-11-09T03:15:10.000Z"
}
```

**`data:changed`**
Data has been updated by another user.

```json
{
  "type": "agenda",
  "action": "create",
  "recordId": "agenda_123",
  "data": { /* agenda data */ },
  "timestamp": "2025-11-09T03:15:10.000Z"
}
```

---

## 🛡️ Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `AUTH_ERROR` | Authentication required | 401 |
| `AUTHZ_ERROR` | Access forbidden | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT_ERROR` | Resource already exists | 409 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Internal server error | 500 |
| `EXTERNAL_API_ERROR` | External service error | 503 |
| `RATE_LIMIT_ERROR` | Too many requests | 429 |
| `NETWORK_ERROR` | Network connectivity issue | 503 |

---

## 📝 Rate Limiting

- **General API**: 100 requests per minute per user
- **Socket.IO**: 50 messages per minute per user
- **Authentication**: 5 attempts per minute

---

## 🆘 Support

For API support and questions:

- **Email**: <tech@keuskupan-surabaya.org>
- **Documentation**: [Internal Wiki]
- **Status Page**: [Status Dashboard]

---

*Last updated: November 9, 2025*
