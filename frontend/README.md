# SPARK Frontend

Aplikasi frontend SPARK dibangun menggunakan React (Vite) dengan pendekatan desain **Antigravity UI** yang modern, responsif (mobile-first), dan difokuskan pada pengguna UMKM (non-teknis).

## ⚙️ Cara Kerja Frontend

1. **State Management (Zustand)**
   Frontend menggunakan `Zustand` untuk mengelola state global seperti sesi pengguna (token JWT), data konteks bisnis (produk, transaksi), dan status UI (loading, error).
2. **API Communication (Axios)**
   Semua permintaan ke backend FastAPI dilakukan melalui HTTP client terpusat di `src/api/`. Interceptor digunakan untuk menyematkan JWT (Bearer token) pada setiap permintaan otomatis, dan menangani error secara seragam.
3. **PWA & Mobile-First**
   Desain difokuskan pada layar ponsel (minimal 375px) dengan elemen sentuh (touch target) berukuran besar minimal 48x48px agar mudah digunakan. Pengguna dapat "menginstal" SPARK ke layar utama perangkat (Progressive Web App).
4. **Alur Validasi (Human-in-the-Loop)**
   Saat fitur **Scan Nota** dijalankan, antarmuka pengguna tidak akan langsung menyimpan hasilnya. Sistem akan meminta pengguna meninjau dan mengedit data hasil ekstraksi OCR AI sebelum disimpan ke database, memastikan keakuratan data.

---

## 📋 Software Requirements Specification (SRS) - Frontend

### Kebutuhan Fungsional (Functional Requirements)

1. **Autentikasi Pengguna**: Sistem harus menyediakan antarmuka bagi pengguna untuk Mendaftar (Register) dan Masuk (Login).
2. **Dasbor Ringkasan**: Dasbor harus menampilkan metrik keuangan utama (pendapatan, pengeluaran, laba) dan kartu rekomendasi pintar dari AI (AI Insights).
3. **Manajemen Produk**: Menyediakan antarmuka untuk menambah, mengedit, dan menghapus produk di katalog dasar, serta melihat stok saat ini.
4. **Pencatatan Transaksi**: Formulir input untuk mencatat penjualan atau pengeluaran bisnis.
5. **Fitur Scan Nota (OCR)**: Tombol unggah atau ambil foto untuk mengekstrak data struk/nota melalui AI, yang kemudian dikonversi ke form yang dapat diedit.
6. **AI Consultant Chat**: Antarmuka percakapan interaktif (chat bubbles) untuk berkonsultasi mengenai kondisi bisnis bersama AI.

### Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Responsivitas**: Tampilan wajib mengutamakan perangkat mobile dan dapat menyesuaikan ukuran layar tablet atau desktop.
2. **Aksesibilitas**: Kontras warna teks memenuhi standar WCAG AA (minimal 4.5:1). Tidak menggunakan jargon teknis dalam teks panduan, label, atau pesan kesalahan.
3. **Performa**: Waktu muat awal (First Contentful Paint) dan pergantian halaman harus kurang dari 2 detik. Dasbor wajib dimuat dalam waktu kurang dari 5 detik.
4. **Desain UX (Antigravity)**: UI menggunakan tema warna *deep space* (latar belakang gelap) dengan sorotan neon (cyan, ungu, hijau) secara selektif untuk menarik perhatian pengguna pada tindakan utama.

---

## 🚀 Cara Menjalankan Frontend

Pastikan Anda sudah menjalankan backend sebelum menjalankan frontend (atau biarkan backend berjalan di terminal terpisah).

1. Buka terminal dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses aplikasi di [http://localhost:3000](http://localhost:3000) (atau port lain yang tertera di terminal).
