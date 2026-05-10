# SPARK (Smart Profit Analytics & Recommendation Kit)

SPARK adalah asisten finansial otomatis untuk UMKM di Indonesia, dilengkapi dengan fitur OCR nota, analisis AI, dan pencatatan stok otomatis.

## 📋 Persyaratan Sistem
Sebelum menjalankan SPARK, pastikan kamu sudah menginstal:
- **Node.js** (v18 atau terbaru) & **npm**
- **Python** (v3.10 atau terbaru) & **pip**
- **Docker** & **Docker Compose** (untuk menjalankan database)

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi SPARK di komputer lokal kamu.

### 1. Menjalankan Database (PostgreSQL)
Aplikasi membutuhkan database PostgreSQL yang berjalan di background.
```bash
# Buka terminal di folder root SPARK
cd /run/media/rizqimaulidiyah/7542d4da-568c-4bbf-b867-1295fe534e4e/spark_antigravity

# Jalankan database dengan Docker Compose
docker compose up -d
```
> Database utama berjalan di port **5432**.

### 2. Menyiapkan & Menjalankan Backend (FastAPI)
Backend menangani logika AI, database, dan otentikasi.

```bash
# Buka terminal baru dan masuk ke folder backend
cd backend

# Buat virtual environment (jika belum ada)
python3 -m venv .venv

# Aktifkan virtual environment
# Untuk Linux/Mac:
source .venv/bin/activate
# Untuk Windows:
# .venv\Scripts\activate

# Instal semua dependensi
pip install -r requirements.txt

# Pastikan file .env sudah diatur dengan benar (copy dari .env.example)
# Tambahkan GEMINI_API_KEY kamu di file .env

# Jalankan server backend
uvicorn main:app --reload --port 8000
```
> Backend berjalan di: **http://localhost:8000**
> Dokumentasi API (Swagger) bisa diakses di: **http://localhost:8000/docs**

### 3. Menyiapkan & Menjalankan Frontend (React/Vite)
Frontend adalah antarmuka yang akan kamu gunakan di browser.

```bash
# Buka terminal baru dan masuk ke folder frontend
cd frontend

# Instal dependensi Node.js
npm install

# Jalankan development server
npm run dev
```
> Frontend berjalan di: **http://localhost:3001** (atau port lain jika 3001 dipakai). Buka link ini di browser kamu.

---

## 🧪 Cara Menjalankan Testing

Kami memiliki _Unit Tests_ dan _Integration Tests_ untuk memastikan semua fungsi berjalan dengan baik (terutama perhitungan finansial dan trigger AI).

### 1. Menjalankan Unit Tests (Cepat, Tanpa Database)
Unit testing menguji fungsi murni tanpa perlu menyalakan database testing.
```bash
cd backend
source .venv/bin/activate

# Jalankan unit tests
PYTHONPATH=. pytest tests/unit/ -v
```

### 2. Menjalankan Integration Tests (Menggunakan Test Database)
Integration testing mengecek alur penuh dari API ke Database (memerlukan database testing khusus agar tidak menimpa data aslimu).

```bash
# Di folder root, jalankan database testing
docker compose -f docker-compose.test.yml up -d

# Masuk ke folder backend
cd backend
source .venv/bin/activate

# Jalankan integration tests
PYTHONPATH=. pytest tests/integration/ -v
```
> Test database berjalan di port **5433**.

---

## ❓ Troubleshooting (Masalah Umum)

- **Port 8000/3000/5432 already in use**: Artinya ada aplikasi lain yang menggunakan port tersebut. Matikan aplikasi tersebut atau ganti port di `main.py` (untuk backend) atau `docker-compose.yml`.
- **Fitur Scan Nota / AI Chat error**: Pastikan `GEMINI_API_KEY` di `backend/.env` sudah terisi dengan API Key yang valid dari Google AI Studio.
- **Data tidak muncul di Dashboard**: Pastikan kamu sudah Login (atau buat akun baru) dan tambahkan transaksi atau produk.
