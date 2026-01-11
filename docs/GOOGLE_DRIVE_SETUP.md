# ☁️ Google Drive Integration Setup

Dokumen ini menjelaskan cara mengatur integrasi Google Drive untuk fitur upload lampiran pada Dashboard Uskup.

## Prasyarat

1.  Akun Google Cloud Platform (GCP).
2.  Akses ke Google Drive folder target.

## Langkah-Langkah Konfigurasi

### 1. Buat Service Account di GCP

1.  Buka [Google Cloud Console](https://console.cloud.google.com/).
2.  Buat Project baru atau pilih project yang sudah ada.
3.  Aktifkan **Google Drive API**.
4.  Ke menu **IAM & Admin** -> **Service Accounts**.
5.  Klik **Create Service Account**.
6.  Beri nama (misal: `dashboard-uskup-uploader`).
7.  Klik **Create and Continue**. (Role opsional, bisa dikosongkan).
8.  Setelah dibuat, klik service account tersebut -> tab **Keys**.
9.  **Add Key** -> **Create new key** -> **JSON**.
10. File JSON akan terdownload. Simpan isinya.

### 2. Siapkan Folder Google Drive

1.  Buka Google Drive dengan akun utama Anda.
2.  Buat folder baru (misal: `Dashboard Attachments`).
3.  Klik kanan folder -> **Share**.
4.  Masukkan **email service account** (yang berakhiran `@...iam.gserviceaccount.com`) ke kolom "Add people".
5.  Berikan akses **Editor**.
6.  Salin **Folder ID** dari URL browser.
    - Contoh URL: `https://drive.google.com/drive/folders/1REQhOXp-FoUHItaBpMiKCo5NrOoZTEfV`
    - Folder ID adalah bagian terakhir: `1REQhOXp-FoUHItaBpMiKCo5NrOoZTEfV`.

### 3. Konfigurasi Environment Variables

Buka file `.env` di root project dan tambahkan/update variabel berikut:

```env
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID="paste_folder_id_disini"
GOOGLE_SERVICE_ACCOUNT_EMAIL="email_service_account_anda@project-id.iam.gserviceaccount.com"

# Private Key dari file JSON (Pastikan formatnya satu baris dengan \n)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Tips**: Saat menyalin Private Key dari file JSON, pastikan karakter _newline_ diganti dengan `\n` agar valid di file `.env`.

### 4. Implementasi Kode (Referensi)

Logika integrasi terdapat di:

- `src/lib/google-drive.ts`: Helper functions (Auth, Upload, Delete).
- `src/app/api/upload/route.ts`: API endpoint yang menerima file dari frontend.

## Troubleshooting

- **Error "Unauthorized"**: Cek kembali `GOOGLE_SERVICE_ACCOUNT_EMAIL` dan `GOOGLE_PRIVATE_KEY`.
- **Error "File not found"**: Pastikan Service Account sudah di-_share_ ke folder target dan `GOOGLE_DRIVE_FOLDER_ID` benar.
- **Error "Invalid Key"**: Format private key di `.env` mungkin salah. Harus menggunakan `\n` untuk baris baru.
