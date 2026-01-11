# 📅 Google Calendar - Setup Guide (Service Account)

Panduan lengkap step-by-step untuk integrasi Google Calendar dengan Dashboard Uskup Surabaya menggunakan Service Account.

**Estimasi Waktu:** 30-45 menit

---

## Bagian 1: Membuat Google Cloud Project

### Step 1.1: Buka Google Cloud Console

1. Buka browser dan akses: https://console.cloud.google.com/
2. Login dengan akun Google yang akan menjadi admin (sebaiknya akun keuskupan seperti `admin@keuskupan-sby.or.id`)

### Step 1.2: Buat Project Baru

1. Klik dropdown project di pojok kiri atas (sebelah logo Google Cloud)
2. Klik **"NEW PROJECT"**
3. Isi informasi:
   - **Project name:** `Dashboard Keuskupan Surabaya`
   - **Organization:** (pilih organisasi jika ada, atau biarkan kosong)
   - **Location:** (biarkan default)
4. Klik **"CREATE"**
5. **Tunggu** sampai project selesai dibuat (30 detik - 1 menit)
6. Pastikan project yang baru dibuat sudah terpilih di dropdown

### Step 1.3: Catat Project ID

1. Buka **Dashboard** project
2. Catat **Project ID** (format: `dashboard-keuskupan-xxxxx`)
3. Simpan untuk referensi nanti

---

## Bagian 2: Enable Google Calendar API

### Step 2.1: Buka API Library

1. Di sidebar kiri, klik **"APIs & Services"** → **"Library"**
2. Atau buka langsung: https://console.cloud.google.com/apis/library

### Step 2.2: Cari dan Enable Calendar API

1. Di search bar, ketik: `Google Calendar API`
2. Klik pada **"Google Calendar API"** (icon kalender biru)
3. Klik tombol biru **"ENABLE"**
4. Tunggu sampai API aktif (10-30 detik)

### Step 2.3: Verifikasi API Aktif

1. Buka **"APIs & Services"** → **"Enabled APIs & services"**
2. Pastikan **"Google Calendar API"** ada di daftar
3. Status harus **"Enabled"**

---

## Bagian 3: Membuat Service Account

### Step 3.1: Buka Service Accounts

1. Di sidebar kiri, klik **"IAM & Admin"** → **"Service Accounts"**
2. Atau buka: https://console.cloud.google.com/iam-admin/serviceaccounts

### Step 3.2: Create Service Account

1. Klik **"+ CREATE SERVICE ACCOUNT"** di atas
2. Isi informasi:
   - **Service account name:** `dashboard-calendar-sync`
   - **Service account ID:** (otomatis terisi, mis: `dashboard-calendar-sync`)
   - **Service account description:** `Service account untuk sinkronisasi Google Calendar dengan Dashboard Keuskupan`
3. Klik **"CREATE AND CONTINUE"**

### Step 3.3: Grant Access (Optional)

1. Di bagian **"Grant this service account access to project"**
2. Ini opsional untuk Calendar API, bisa di-skip
3. Klik **"CONTINUE"**

### Step 3.4: Grant User Access (Optional)

1. Di bagian **"Grant users access to this service account"**
2. Ini juga opsional
3. Klik **"DONE"**

### Step 3.5: Catat Email Service Account

Service account akan memiliki email seperti:

```
dashboard-calendar-sync@dashboard-keuskupan-xxxxx.iam.gserviceaccount.com
```

**⚠️ PENTING:** Salin email ini! Akan digunakan untuk sharing kalender.

---

## Bagian 4: Generate JSON Key

### Step 4.1: Buka Service Account Detail

1. Di daftar Service Accounts, klik pada service account yang baru dibuat
2. Atau klik pada emailnya

### Step 4.2: Create Key

1. Klik tab **"KEYS"**
2. Klik **"ADD KEY"** → **"Create new key"**
3. Pilih **"JSON"** (default)
4. Klik **"CREATE"**

### Step 4.3: Download dan Simpan Key

1. File JSON akan otomatis ter-download
2. Nama file seperti: `dashboard-keuskupan-xxxxx-abc123def456.json`
3. **⚠️ SANGAT PENTING:**
   - File ini RAHASIA, jangan share ke siapapun
   - Jangan commit ke Git
   - Simpan di tempat aman

### Step 4.4: Isi File JSON

Buka file JSON untuk verifikasi. Isinya seperti:

```json
{
  "type": "service_account",
  "project_id": "dashboard-keuskupan-xxxxx",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvg...",
  "client_email": "dashboard-calendar-sync@dashboard-keuskupan-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## Bagian 5: Setup Google Calendar

### Step 5.1: Buka Google Calendar

1. Buka: https://calendar.google.com/
2. Login dengan akun yang akan menjadi pemilik kalender (akun keuskupan)

### Step 5.2: Buat Kalender Baru (Jika Belum Ada)

1. Di sidebar kiri, klik **"+"** di sebelah "Other calendars"
2. Pilih **"Create new calendar"**
3. Isi:
   - **Name:** `Agenda Keuskupan Surabaya`
   - **Description:** `Kalender resmi agenda Keuskupan Surabaya - sync dengan Dashboard`
   - **Time zone:** `(GMT+07:00) Western Indonesia Time - Jakarta`
4. Klik **"Create calendar"**

### Step 5.3: Share Kalender ke Service Account

**⚠️ LANGKAH PALING PENTING!**

1. Di sidebar kiri, hover kalender **"Agenda Keuskupan Surabaya"**
2. Klik ikon **⋮** (3 titik vertikal)
3. Pilih **"Settings and sharing"**
4. Scroll ke bagian **"Share with specific people or groups"**
5. Klik **"+ Add people and groups"**
6. Paste email Service Account:
   ```
   dashboard-calendar-sync@dashboard-keuskupan-xxxxx.iam.gserviceaccount.com
   ```
7. Set permission ke **"Make changes to events"**
8. Klik **"Send"** (tidak ada email yang dikirim karena service account)

### Step 5.4: Dapatkan Calendar ID

1. Di halaman Settings kalender yang sama
2. Scroll ke bagian **"Integrate calendar"**
3. Cari **"Calendar ID"**
4. Salin ID tersebut, formatnya seperti:
   ```
   abc123xyz@group.calendar.google.com
   ```
   atau jika kalender utama:
   ```
   email@keuskupan-sby.or.id
   ```

---

## Bagian 6: Konfigurasi Dashboard

### Step 6.1: Set Environment Variables

Buka file `.env` di root project dan tambahkan:

```env
# Google Calendar Integration
GOOGLE_CALENDAR_ID=abc123xyz@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=dashboard-calendar-sync@dashboard-keuskupan-xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg..."
```

### Step 6.2: Format Private Key

**Private Key harus di-format dengan benar:**

1. Buka file JSON yang di-download
2. Copy value dari `"private_key"` (termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`)
3. Paste ke `.env` dalam satu baris dengan `\n` sebagai line break
4. Pastikan dalam tanda kutip ganda `"..."`

### Step 6.3: Alternatif - Simpan JSON File

Jika kesulitan dengan private key di env var:

1. Simpan file JSON ke `config/google-service-account.json`
2. Tambahkan ke `.gitignore`:
   ```
   config/google-service-account.json
   ```
3. Set environment:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=config/google-service-account.json
   ```

---

## Bagian 7: Install Dependencies

### Step 7.1: Install googleapis Package

```bash
npm install googleapis
```

### Step 7.2: Verify Installation

```bash
npm list googleapis
```

Harus menampilkan versi googleapis yang terinstall.

---

## Bagian 8: Test Koneksi

### Step 8.1: Buat Test Script

Buat file `scripts/test-google-calendar.ts`:

```typescript
import { google } from "googleapis";

async function testConnection() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    console.log("✅ Koneksi berhasil!");
    console.log(`📅 Found ${response.data.items?.length || 0} upcoming events`);

    response.data.items?.forEach((event) => {
      console.log(
        `  - ${event.summary} (${event.start?.dateTime || event.start?.date})`
      );
    });
  } catch (error: any) {
    console.error("❌ Koneksi gagal:", error.message);
  }
}

testConnection();
```

### Step 8.2: Run Test

```bash
npx tsx scripts/test-google-calendar.ts
```

### Step 8.3: Expected Output

```
✅ Koneksi berhasil!
📅 Found 3 upcoming events
  - Misa Mingguan (2026-01-11T09:00:00+07:00)
  - Rapat Pastoral (2026-01-15T14:00:00+07:00)
  ...
```

---

## Troubleshooting

### Error: "Calendar not found"

- Pastikan Calendar ID benar
- Pastikan kalender sudah di-share ke service account

### Error: "Insufficient permission"

- Pastikan permission "Make changes to events" sudah di-set
- Tunggu beberapa menit untuk propagation

### Error: "Invalid credentials"

- Pastikan private key format benar (dengan `\n`)
- Pastikan email service account sesuai dengan JSON

### Error: "API not enabled"

- Pastikan Google Calendar API sudah di-enable di project
- Pastikan project ID sesuai

---

## Checklist Final

- [ ] Google Cloud Project dibuat
- [ ] Google Calendar API enabled
- [ ] Service Account dibuat
- [ ] JSON key di-download
- [ ] Kalender di-share ke service account email
- [ ] Calendar ID dicatat
- [ ] Environment variables di-set
- [ ] `googleapis` package installed
- [ ] Test script berhasil

---

## Next Steps

Setelah setup selesai, implementasi API endpoint untuk sync:

1. `POST /api/google-calendar/sync` - Sync agenda ke Google
2. `GET /api/google-calendar/events` - Get events dari Google
3. Update `handleSyncGoogleCalendar` di frontend

Lihat: [API Implementation Guide](./GOOGLE_CALENDAR_API_IMPLEMENTATION.md)
