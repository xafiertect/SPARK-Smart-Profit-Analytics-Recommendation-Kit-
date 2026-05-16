# SPARK (Smart Profit Analytics & Recommendation Kit)

SPARK adalah asisten finansial otomatis untuk UMKM di Indonesia, dilengkapi dengan fitur OCR nota, analisis AI, dan pencatatan stok otomatis.

### Tampilan Aplikasi
<div style="display: flex; gap: 20px; align-items: flex-start;">
  <img src="assets/desktop_demo.png" alt="Desktop Dashboard" width="600" />
  <img src="assets/mobile_demo.png" alt="Mobile Dashboard" width="300" />
</div>

📚 **Dokumentasi Lengkap (SRS & Cara Kerja Detil)**:
- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## 📋 Persyaratan Sistem

Pastikan kamu sudah menginstal:

| Software | Versi Minimum | Cek Instalasi |
|----------|---------------|---------------|
| **Node.js** | v18+ | `node --version` |
| **npm** | v9+ | `npm --version` |
| **Python** | v3.10+ | `python3 --version` |
| **pip** | v22+ | `pip --version` |
| **Docker** | v20+ | `docker --version` |
| **Docker Compose** | v2+ | `docker compose version` |

---

## 🚀 Cara Menjalankan Aplikasi

### Langkah 1: Clone Repository

```bash
# Clone branch type12
gh repo clone xafiertect/SPARK-Smart-Profit-Analytics-Recommendation-Kit- spark-app -- -b type12

# Masuk ke folder project
cd spark-app
```

---

### Langkah 2: Jalankan Database (PostgreSQL via Docker)

```bash
# Di folder root project
docker compose up -d
```

> **Catatan:** Jika port `5432` sudah digunakan oleh PostgreSQL lokal, ubah port di `docker-compose.yml`:
> ```yaml
> ports:
>   - "5435:5432"   # ubah 5432 ke port lain, misal 5435
> ```
> Jangan lupa sesuaikan juga port di `backend/.env`:
> ```
> DATABASE_URL=postgresql+asyncpg://spark:spark_secret@localhost:5435/spark_db
> ```

Cek database sudah jalan:
```bash
docker compose ps
# spark_db harus berstatus "running" / "healthy"
```

---

### Langkah 3: Siapkan & Jalankan Backend (FastAPI)

```bash
# Masuk ke folder backend
cd backend

# Buat virtual environment
python3 -m venv venv

# Aktifkan virtual environment
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows

# Instal dependensi
pip install -r requirements.txt
```

#### Konfigurasi Environment

```bash
# Copy file konfigurasi
cp .env.example .env
```

Edit file `backend/.env` dan isi konfigurasi berikut:

```env
DATABASE_URL=postgresql+asyncpg://spark:spark_secret@localhost:5432/spark_db
SECRET_KEY=change-me-to-a-random-32-char-string-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=true
GEMINI_API_KEY=ISI_API_KEY_KAMU_DISINI
GEMINI_MODEL=gemini-2.0-flash
LLM_TIMEOUT_SECONDS=15
```

> **Penting:**
> - Dapatkan `GEMINI_API_KEY` gratis dari [Google AI Studio](https://aistudio.google.com/apikey)
> - Tulis API key **tanpa tanda petik** (tanpa `''` atau `""`)
> - Sesuaikan port di `DATABASE_URL` dengan port Docker kamu

#### Buat File `alembic.ini`

File ini tidak ada di repository (masuk `.gitignore`). Buat manual di folder `backend/`:

```bash
cat > alembic.ini << 'EOF'
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql+asyncpg://spark:spark_secret@localhost:5432/spark_db

[logging]
default_handler = console

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
EOF
```

> **Penting:** Sesuaikan `sqlalchemy.url` di `alembic.ini` dengan port yang sama di `.env`

#### Jalankan Migrasi Database

```bash
# Pastikan virtual environment aktif
source venv/bin/activate

# Jalankan migrasi
alembic upgrade head
```

Output yang diharapkan:
```
INFO  [alembic.runtime.migration] Running upgrade  -> ce56620200ec, initial_schema
INFO  [alembic.runtime.migration] Running upgrade ce56620200ec -> 0c7d546735ea, add_rls_and_indexes
```

#### Jalankan Backend

```bash
uvicorn main:app --reload --port 8000
```

Verifikasi:
- Backend: [http://localhost:8000/health](http://localhost:8000/health) → `{"status": "ok"}`
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Langkah 4: Siapkan & Jalankan Frontend (React/Vite)

Buka **terminal baru** (biarkan backend tetap jalan):

```bash
# Masuk ke folder frontend
cd frontend

# Instal dependensi
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: [http://localhost:3000](http://localhost:3000)

---

## ✅ Verifikasi Semua Berjalan

Buka 3 terminal dan pastikan semua service aktif:

| Terminal | Perintah | Status |
|----------|----------|--------|
| 1 | `docker compose ps` | spark_db = running |
| 2 | Backend sudah jalan | `Uvicorn running on http://127.0.0.1:8000` |
| 3 | Frontend sudah jalan | `VITE ready` di `http://localhost:3000` |

Test cepat via browser:
1. Buka [http://localhost:3000](http://localhost:3000) → halaman Login muncul
2. Klik **Daftar** untuk buat akun baru
3. Setelah login → masuk ke Dashboard

---

## 🧪 Cara Menjalankan Testing

### Unit Tests (Cepat, Tanpa Database)

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/unit/ -v
```

Output yang diharapkan:
```
tests/unit/test_ai_agent_triggers.py    ✅ 6 passed
tests/unit/test_financial_engine.py     ✅ 4 passed
======================== 10 passed ========================
```

### Integration Tests (Menggunakan Test Database)

```bash
# Di folder root, jalankan database testing (port 5433)
docker compose -f docker-compose.test.yml up -d

# Masuk ke folder backend
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/integration/ -v
```

---

## 📁 Struktur Project

```
spark2/
├── docker-compose.yml          # PostgreSQL database (production)
├── docker-compose.test.yml     # PostgreSQL database (testing)
├── backend/
│   ├── main.py                 # Entry point FastAPI
│   ├── .env                    # Konfigurasi (TIDAK di-commit)
│   ├── alembic.ini             # Konfigurasi migrasi (TIDAK di-commit)
│   ├── alembic/                # File migrasi database
│   ├── core/
│   │   ├── config.py           # Settings dari environment
│   │   ├── database.py         # Koneksi database async
│   │   └── security.py         # JWT & password hashing
│   ├── routers/                # API endpoints
│   │   ├── auth.py             # Register, login, refresh token
│   │   ├── products.py         # CRUD produk
│   │   ├── transactions.py     # Catat transaksi jual/beli
│   │   ├── ocr.py              # Scan nota via Gemini Vision
│   │   ├── agent.py            # AI insights & chat
│   │   └── dashboard.py        # Ringkasan keuangan
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic validation schemas
│   ├── services/
│   │   ├── ocr_service.py      # Gemini Vision OCR
│   │   ├── llm_service.py      # Gemini chat & explanation
│   │   ├── financial_engine.py # Kalkulasi keuangan (rule-based)
│   │   ├── ai_agent.py         # AI triggers (low stock, expense spike)
│   │   └── context_builder.py  # Agregasi data bisnis untuk AI
│   └── tests/                  # Unit & integration tests
└── frontend/
    ├── src/
    │   ├── App.jsx             # Routing utama
    │   ├── pages/              # Halaman (Dashboard, Scan, Chat, dll)
    │   ├── api/                # API client & endpoint functions
    │   ├── stores/             # Zustand state management
    │   └── components/         # Reusable UI components
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/v1/auth/register` | Daftar akun baru |
| POST | `/api/v1/auth/login` | Login, dapat JWT token |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/profile` | Lihat profil user |
| GET | `/api/v1/products/` | Daftar semua produk |
| POST | `/api/v1/products/` | Tambah produk baru |
| PUT | `/api/v1/products/{id}` | Edit produk |
| DELETE | `/api/v1/products/{id}` | Hapus produk (soft delete) |
| GET | `/api/v1/transactions/` | Daftar transaksi (filter tanggal) |
| POST | `/api/v1/transactions/` | Catat transaksi baru |
| GET | `/api/v1/transactions/{id}` | Detail transaksi |
| POST | `/api/v1/ocr/scan` | Scan nota (upload gambar) |
| GET | `/api/v1/dashboard/summary` | Ringkasan keuangan hari ini & minggu ini |
| GET | `/api/v1/agent/insights` | Lihat AI insights |
| POST | `/api/v1/agent/insights/generate` | Generate AI insights baru |
| POST | `/api/v1/agent/chat` | Chat dengan AI consultant |

---

## 🔄 Alur Kerja Keseluruhan (System Workflow)

Sistem SPARK memiliki alur kerja utama sebagai berikut:

1. **Inisialisasi Katalog**: Pengguna (UMKM) mendaftarkan produk dasar beserta harga beli, harga jual, dan stok awal.
2. **Pencatatan Transaksi**: Pengguna dapat menambahkan transaksi secara manual, atau menggunakan kamera/unggahan file untuk **Scan Nota**.
3. **Ekstraksi OCR & AI Parsing**: Gambar nota dikirim ke backend, diproses oleh model Gemini Vision (AI) untuk mengekstrak barang, jumlah, dan harga menjadi JSON terstruktur.
4. **Validasi Klien (Human-in-the-Loop)**: AI mengembalikan hasil ekstraksi ke antarmuka aplikasi. Pengguna dapat mengedit/mengoreksi sebelum menyimpannya ke *Database*.
5. **Pembaruan Kalkulasi (Financial Engine)**: Saat transaksi disimpan, sistem melakukan kalkulasi deterministik: pendapatan, pengeluaran, laba bersih, serta memperbarui jumlah stok terkait secara real-time.
6. **Pemantauan Cerdas (AI Agent)**: Sistem (AI Agent) secara otomatis mendeteksi kondisi khusus seperti *stok rendah* atau *pengeluaran melonjak*. Saat pemicu ini aktif, backend memanggil LLM untuk merangkum penjelasannya ke dalam wawasan (*Insight*) bagi pengguna.
7. **Konsultasi Interaktif**: Pengguna berinteraksi dengan AI Consultant Chat menggunakan konteks bisnis secara utuh (data riwayat transaksi & wawasan) guna mendapatkan rekomendasi yang praktis dan relevan.

---

## 📋 Software Requirements Specification (SRS) - Keseluruhan Sistem

### 1. Kebutuhan Fungsional (Functional Requirements)
- **Modul Pengguna**: Pendaftaran, Login, dan manajemen profil pengguna terisolasi.
- **Modul Inventaris**: *Create, Read, Update, Soft-Delete* (CRUD) produk dan manajemen stok yang akan otomatis terpotong saat terjadi transaksi penjualan.
- **Modul Transaksi**: Mendukung input pendapatan dan pengeluaran baik secara manual maupun menggunakan pemindaian optik (OCR) didukung AI.
- **Modul Kecerdasan Buatan (AI)**:
  - Ekstraksi informasi nota.
  - Pemicu otomatis (AI Insights) untuk merekomendasikan restock dan penghematan.
  - Chat interaktif khusus konteks bisnis pengguna.

### 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)
- **Keamanan (Security)**: Data di basis data dilindungi menggunakan Row-Level Security (RLS) PostgreSQL untuk mencegah kebocoran antar akun. Akses menggunakan standar JWT.
- **Performa (Performance)**:
  - Waktu muat awal (FCP) antarmuka maksimal 2 detik.
  - Respons OCR/AI dibatasi maksimal 15 detik sebelum mekanisme *fallback* manual diaktifkan.
- **Keandalan (Reliability)**: Operasi perhitungan kas dan stok (*Financial Engine*) sepenuhnya deterministik, sehingga perhitungan dijamin stabil dan konsisten.
- **Antarmuka Pengguna (Usability)**: Desain *Mobile-First* berkonsep UI Antigravity dengan target audiens pemilik UMKM awam (tanpa jargon teknis dan tombol mudah diakses).

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Port 5432 already in use | Ubah port di `docker-compose.yml` dan `.env` (misal: `5435`) |
| `No 'script_location' key found` | Buat file `alembic.ini` (lihat panduan di atas) |
| Scan Nota / AI Chat error | Pastikan `GEMINI_API_KEY` valid dan `GEMINI_MODEL=gemini-2.0-flash` |
| `429 RESOURCE_EXHAUSTED` | Quota API habis. Tunggu beberapa detik atau upgrade ke billing plan |
| `models/gemini-3.0-flash not found` | Ubah `GEMINI_MODEL` di `.env` ke `gemini-2.0-flash` |
| Data tidak muncul di Dashboard | Pastikan sudah login dan tambahkan transaksi/produk |
| Unit tests gagal koneksi DB | Pastikan `conftest.py` punya `autouse=False` di `apply_migrations` |
