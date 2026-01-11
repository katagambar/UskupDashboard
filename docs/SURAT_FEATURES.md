# 📮 Fitur Surat Menyurat (Surat Features)

Modul **Surat Menyurat** adalah komponen inti dari Dashboard Uskup Surabaya yang memungkinkan pengelolaan korespondensi digital secara efisien, aman, dan terintegrasi. Dokumen ini menjelaskan fitur-fitur utama dan alur kerjanya.

## 🌟 Fitur Utama

### 1. Kodifikasi Surat Otomatis (G-Code System)

Sistem ini menerapkan aturan ketat untuk "Surat Keluar" yang dikeluarkan oleh Keuskupan:

- **Validasi Ketat**: Dropdown "Jenis Surat" HANYA menampilkan kode dengan awalan **'G'** (contoh: G.100, G.110).
- **Format Konsisten**: `G.XXX/TAHUN/URUTAN` (misal: `G.100/2026/001`).
- **Data Statis**: Kode diambil dari referensi standar Keuskupan (bukan input bebas) untuk menjaga integritas arsip.

### 2. Lampiran File Terintegrasi (Google Drive)

Mendukung pengunggahan dokumen pendukung untuk setiap surat:

- **Penyimpanan Cloud**: File disimpan dengan aman di Google Drive melalui Service Account terdedikasi.
- **Tipe File**: Mendukung PDF, Gambar (JPG/PNG), dan dokumen teks.
- **Metadata**: Nama file dan link tersimpan rapi di database lokal.
- **Akses**: File dapat diunduh kembali kapan saja dari detail surat.

### 3. Ekspor Dokumen Fleksibel

Tersedia dua format unduhan untuk surat yang telah dibuat:

- **📄 Download PDF**: Hasil akhir siap cetak/kirim. Menggunakan format baku Keuskupan dengan kop surat resmi. (Nama file: `Surat_NOMOR.pdf`).
- **📝 Download Word (Edit)**: Format `.docx` yang dapat diedit. Sangat berguna jika staf perlu melakukan penyesuaian manual pada layout atau konten sebelum pencetakan final.

### 4. Rich Text Editor

Penulisan isi surat menggunakan editor canggih (TipTap) yang mendukung:

- Bold, Italic, Underline.
- List (Bulleted/Numbered).
- Perataan Teks (Align Left/Center/Right/Justify).
- Bold, Italic, Underline.
- List (Bulleted/Numbered).
- Perataan Teks (Align Left/Center/Right/Justify).
- **Persistensi**: Isi draft tersimpan otomatis dan tidak hilang saat reload halaman.

### 5. Template Master (Rich Text)

Pengelolaan template surat kini lebih _powerful_:

- **Editor Kaya Fitur**: Admin dapat membuat template dengan format teks lengkap (Tebal, Miring, Heading) langsung dari menu **Master Data**.
- **Preview Langsung**: Apa yang Anda lihat di editor template akan menjadi dasar surat baru.

### 6. Kop Surat Dinamis (Configurable Letterhead)

Kop surat pada hasil unduhan PDF dan Word kini dapat dikonfigurasi tanpa harus mengubah kode program:

- **Menu Konfigurasi**: Akses via **Master Data -> Parameter** -> Pilih Tipe "Konfigurasi Kop Surat".
- **Parameter yang Didukung**:
  - `NAMA`: Nama institusi (misal: "KEUSKUPAN SURABAYA").
  - `ALAMAT`: Alamat lengkap.
  - `KONTAK`: Nomor telepon dan email.
- Jika parameter belum diset, sistem akan menggunakan nilai default.

### 7. Keamanan & Hak Akses (RBAC)

- **Viewer**: Pengguna umum hanya dapat melihat surat yang relevan.
- **Editor/Creator**: Staf Keuskupan dapat membuat dan mengedit draft.
- **Approver**: Hanya role tertentu (Uskup/Sekretaris/Vikjen) yang memiliki wewenang finalisasi surat.

## 🚀 Alur Kerja (Workflow)

1.  **Buat Draft**:

    - Navigasi ke menu "Surat Menyurat" -> "Surat Baru".
    - Pilih Jenis Surat (Kode G).
    - Klik "Generate" untuk mendapatkan Nomor Surat otomatis.
    - Isi Judul, Tujuan, dan Isi Surat.
    - (Opsional) Unggah lampiran di "Step 5".
    - Klik "Simpan Draft" atau "Kirim Surat".

2.  **Review & Edit**:

    - Buka detail surat dari daftar.
    - Gunakan tombol **"Download Word (Edit)"** untuk memeriksa format di Microsoft Word jika diperlukan.
    - Edit kembali di aplikasi jika ada koreksi.

3.  **Hapus**:

    - Surat yang salah buat dapat dihapus (ikon tong sampah).
    - **Note**: Penghapusan bersifat permanen dari database.

4.  **Arsip**:
    - Surat yang berstatus "Terkirim" akan tersimpan di arsip digital dan dapat dicari kembali berdasarkan Nomor, Judul, atau Tanggal.
