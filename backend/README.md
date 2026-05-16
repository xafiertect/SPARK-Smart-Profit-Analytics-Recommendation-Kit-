# SPARK Backend

Sistem backend SPARK dibangun menggunakan **FastAPI** (Python) dan **PostgreSQL**. Dirancang dengan fokus pada keamanan, asinkronitas (async), modularitas, dan kecepatan kalkulasi keuangan deterministik yang digabungkan dengan kemampuan analitik cerdas dari LLM.

## ⚙️ Cara Kerja Backend

1. **Routing & API Gateway**
   Semua permintaan yang masuk dilayani oleh FastAPI melalui rute-rute (`routers/`) spesifik seperti `/api/v1/transactions`, `/api/v1/ocr`, atau `/api/v1/agent`. Semua rute bersifat asinkron (`async def`) agar I/O tidak memblokir antrean permintaan (terutama saat memanggil AI).
2. **Lapisan Layanan (Service Layer)**
   Backend memiliki pemisahan yang jelas antara aturan logika teknis dan bisnis:
   - `financial_engine.py`: Sepenuhnya *rule-based* deterministik. Tidak menggunakan AI untuk berhitung. Mengelola perhitungan laba, pendapatan, pengeluaran, dan stok.
   - `ai_agent.py`: Mengeksekusi pemicu (trigger) seperti `LOW_STOCK` atau `EXPENSE_SPIKE` secara deterministik sebelum mengirimnya ke LLM (Gemini) untuk penjelasan teks berbahasa Indonesia.
   - `ocr_service.py` & `llm_service.py`: Mengolah gambar struk menggunakan AI visual untuk diubah menjadi JSON terstruktur (di-validasi oleh Pydantic).
3. **Database & Keamanan (PostgreSQL)**
   Backend terhubung ke database menggunakan `SQLAlchemy` mode asinkron. Keamanan tingkat baris data (Row-Level Security / RLS) diaktifkan secara mendasar sehingga transaksi satu pengguna tidak mungkin bocor atau diakses oleh pengguna lain melalui titik rawan kode.
4. **Pydantic Validation**
   Semua data yang masuk dari frontend dan data yang kembali dari AI secara ketat divalidasi oleh skema Pydantic (`schemas/`). Jika data LLM rusak/tidak sesuai skema, backend menolak dan memberikan notifikasi kegagalan secara anggun.

---

## 📋 Software Requirements Specification (SRS) - Backend

### Kebutuhan Fungsional (Functional Requirements)

1. **Otentikasi & Otorisasi**: Sistem mengeluarkan dan memverifikasi token JWT (Access & Refresh) untuk setiap API yang dilindungi.
2. **Kalkulasi Deterministik**: Mesin keuangan (Financial Engine) wajib mencatat masuk/keluar kas, memotong stok secara otomatis saat penjualan, dan menghitung laba dengan akurasi matematis tanpa pengaruh AI.
3. **Pemrosesan AI OCR**: Menerima unggahan *multipart/form-data* (gambar), mengekstrak informasi via Gemini, dan memformat hasilnya menjadi skema JSON dengan struktur tertentu untuk direspons ke klien.
4. **Sistem Pemicu Pintar (AI Agent)**: Sistem backend harus memantau batas stok yang lebih rendah dari ambang batas aman atau peningkatan biaya signifikan per minggu, yang kemudian memicu rekaman ringkasan wawasan di tabel database.
5. **Soft-Delete**: Semua operasi penghapusan data keuangan menggunakan *soft delete* (`is_deleted=true`) tanpa membuang baris data secara permanen.

### Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Kecepatan**: Endpoint API reguler (seperti mengambil riwayat) harus merespons di bawah 500ms. Waktu tunggu respons AI / pemrosesan LLM harus dibatasi (timeout = 15 detik), setelah itu berlanjut ke fallback *rule-based*.
2. **Keamanan**: Basis data hanya menerima koneksi internal. RLS PostgreSQL wajib diterapkan.
3. **Asynchronous Processing**: Segala proses yang melakukan interaksi jaringan ke layanan eksternal (API LLM) wajib bersifat _non-blocking_ menggunakan `async/await`.
4. **Skalabilitas & Modularitas**: Komponen basis data (model ORM) tidak boleh digunakan secara langsung sebagai bentuk respons API (wajib dibentuk melalui _Data Transfer Objects_ / _Schemas_).

---

## 🚀 Cara Menjalankan Backend

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan *virtual environment*:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # Linux/Mac
   # venv\Scripts\activate     # Windows
   ```
3. Instal semua dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Siapkan konfigurasi (copy dari example dan isi credential):
   ```bash
   cp .env.example .env
   # Edit .env dan pastikan DATABASE_URL serta GEMINI_API_KEY terisi dengan benar.
   ```
5. Siapkan koneksi Database (wajib menjalankan PostgreSQL lokal atau via Docker Compose di folder root):
   ```bash
   # Masuk ke folder root project di terminal terpisah
   docker compose up -d
   ```
6. Jalankan migrasi database (Alembic):
   ```bash
   alembic upgrade head
   ```
7. Jalankan server FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
8. Buka [http://localhost:8000/docs](http://localhost:8000/docs) untuk melihat dokumentasi API interaktif.
