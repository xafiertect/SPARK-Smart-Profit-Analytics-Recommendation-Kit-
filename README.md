# SPARK (Smart Profit Analytics & Recommendation Kit)

SPARK adalah aplikasi berbasis AI (Artificial Intelligence) untuk UMKM. Sistem ini dirancang untuk membaca nota/struk belanja secara otomatis menggunakan OCR, membersihkan dan memvalidasi datanya menggunakan LLM (Google Gemini), mengatur histori transaksi, memotong stok secara otomatis, serta memberikan insight bisnis proaktif (Explainable AI).

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan komputer Anda telah terinstal:
- **Python 3.10+** (untuk Backend FastAPI)
- **Node.js 18+** (untuk Frontend React/Vite)
- **Docker** (Disarankan, untuk menjalankan PostgreSQL dengan mudah) atau instalasi PostgreSQL lokal.
- **Akun Google AI Studio** (Untuk mendapatkan API Key Gemini).

---

## 🚀 Panduan Menjalankan Aplikasi

Aplikasi ini terdiri dari 3 pilar utama: Database, Backend, dan Frontend. Ikuti langkah-langkah di bawah ini secara berurutan.

### Langkah 1: Menjalankan Database PostgreSQL

Backend SPARK membutuhkan database PostgreSQL yang menyala. Cara termudah adalah menggunakan Docker. Buka terminal baru dan jalankan perintah berikut:

```bash
docker run --name spark-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=spark_db -p 5432:5432 -d postgres
```
*(Catatan: Biarkan Docker ini berjalan di background).*

---

### Langkah 2: Konfigurasi & Menjalankan Backend (FastAPI)

Backend menangani logika AI (PaddleOCR + Gemini) dan transaksi database.

1. Buka terminal baru, lalu masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Aktifkan *Virtual Environment* (venv):
   ```bash
   source venv/bin/activate
   ```
3. **Konfigurasi Environment Variable (.env)**:
   Aplikasi SPARK membutuhkan akses ke database dan model AI Gemini. 
   Buka file `backend/.env` (atau buat jika belum ada) dan isi dengan konfigurasi berikut:
   ```env
   # Pengaturan Database (Sesuai dengan kredensial Docker di Langkah 1)
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/spark_db
   
   # Pengaturan AI (Google Gemini)
   # Dapatkan API Key secara gratis di: https://aistudio.google.com/app/apikey
   GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
   ```
   *Penting: Pastikan Anda mengganti `masukkan_api_key_gemini_anda_di_sini` dengan API Key asli milik Anda sebelum melanjutkan.*
4. Jalankan server FastAPI:
   ```bash
   uvicorn app.main:app --reload
   ```
   *Jika berhasil, server backend akan berjalan di: **http://localhost:8000***
   *Anda bisa melihat dokumentasi API interaktif di: **http://localhost:8000/docs***

---

### Langkah 3: Menjalankan Frontend (React UI)

Frontend adalah antarmuka visual tempat pengguna mengunggah gambar nota dan melakukan validasi (Human-in-the-Loop).

1. Buka terminal baru (biarkan terminal backend tetap berjalan), lalu masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Pastikan dependensi sudah terinstal (hanya perlu dijalankan sekali):
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Jika berhasil, UI Frontend akan bisa diakses melalui browser di: **http://localhost:5173***

---

## 🧪 Alur Pengujian Aplikasi (Workflow)

Untuk mencoba aplikasi secara keseluruhan, ikuti alur ini:

1. **Baseline Setup (Via Swagger)**
   - Karena UI untuk produk belum dibuat, buka `http://localhost:8000/docs`.
   - Gunakan endpoint `POST /api/v1/products/` untuk mendaftarkan barang (misal: "Indomie", Qty: 100). Ini akan menjadi "Baseline" database Anda.
2. **Upload & Validasi (Via Frontend)**
   - Buka UI di `http://localhost:5173`.
   - Unggah gambar struk yang berisi tulisan "Indomie" dan jumlahnya.
   - Tunggu AI mengekstrak data. Setelah selesai, tabel validasi akan muncul.
3. **Penyimpanan Transaksi**
   - Di UI Frontend, setelah Anda memeriksa angka pada tabel, klik tombol **"Konfirmasi & Simpan"**.
   - Sistem akan memotong stok "Indomie" di database sebesar kuantitas yang ada di tabel.
4. **Proactive Insight (Via Swagger)**
   - Buka kembali `http://localhost:8000/docs`.
   - Akses endpoint `GET /api/v1/insights/`. AI akan menganalisis sisa stok dan transaksi, lalu memberikan saran (misal: "Segera restok Indomie karena penjualan tinggi dan sisa stok menipis!").

---
*Dibuat oleh Tim Antigravity SPARK.*
