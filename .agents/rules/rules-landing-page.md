# Rules Agent: Landing Page / Dashboard Awal SPARK

## Konteks
Bagian: **Halaman Utama (Landing Page)**
Masalah saat ini: Aplikasi langsung mengarahkan pengguna ke halaman login tanpa ada halaman pengenalan produk terlebih dahulu.

---

## Tujuan
Membuat halaman awal (landing page) yang menampilkan konten produk SPARK secara menarik, informatif, dan profesional — sebelum pengguna masuk ke sistem. Halaman ini juga menjadi titik masuk untuk Sign In dan Sign Up.

---

## RULE L-1 — Routing: Halaman Awal Bukan Halaman Login

```
UBAH perilaku default aplikasi:
  SEBELUM: buka aplikasi → langsung ke halaman /login
  SESUDAH: buka aplikasi → tampilkan halaman / (landing page)

Halaman login HANYA dapat diakses melalui:
  → Tombol "Sign In" di navbar kanan atas
  → Tombol "Sign In" di hero section (jika ada)
  → Redirect otomatis jika user mencoba akses halaman yang butuh autentikasi
```

---

## RULE L-2 — Struktur Navbar

```
Navbar HARUS berisi:
  KIRI  : Logo SPARK + tagline singkat
  TENGAH: Menu navigasi (opsional, jika ada section di halaman)
           - Fitur
           - Cara Kerja
           - Tentang
  KANAN : Tombol "Sign In" (outline/ghost) + Tombol "Sign Up" (filled/primary)

Navbar bersifat sticky (tetap di atas saat scroll).
Navbar menggunakan transparansi di atas hero, solid saat scroll melewati hero.
```

**Spesifikasi tombol:**

| Tombol | Tipe | Aksi |
|---|---|---|
| Sign In | Outline / Ghost | Navigasi ke /login |
| Sign Up | Primary (filled) | Navigasi ke /register |

---

## RULE L-3 — Struktur Konten Landing Page

Landing page terdiri dari section-section berikut (berurutan):

### Section 1: Hero
```
Konten:
  - Headline utama: nama produk SPARK dan value proposition utama
  - Sub-headline: deskripsi singkat 1–2 kalimat
  - CTA primer: "Mulai Gratis" → /register
  - CTA sekunder: "Pelajari Lebih Lanjut" → scroll ke section fitur
  - Visual: ilustrasi/mockup dashboard atau grafik keuangan

Contoh headline:
  "SPARK — Asisten Keuangan Cerdas untuk UMKM Anda"
  Sub: "Dari scan nota hingga rekomendasi bisnis — otomatis, akurat, dan mudah dipahami."
```

### Section 2: Problem Statement (Mengapa SPARK?)
```
Konten:
  - 3 masalah utama UMKM yang diselesaikan SPARK:
    1. Stok habis mendadak tanpa peringatan
    2. Profit riil tidak terpantau karena pembukuan manual
    3. Keputusan bisnis berdasarkan intuisi, bukan data
  - Tampilkan dalam format kartu / ikon + teks singkat
```

### Section 3: Fitur Utama
```
Konten: tampilkan 5 fitur utama dengan ikon, judul, dan deskripsi singkat:
  1. Scan Nota Otomatis (OCR)
     "Foto nota → data transaksi terstruktur dalam hitungan detik."
  2. AI Agent Proaktif
     "Sistem mendeteksi masalah dan memberi rekomendasi tanpa perlu diminta."
  3. Pembukuan Otomatis
     "Income, expense, profit/loss, dan cash flow — terhitung otomatis."
  4. Rekomendasi Stok
     "Tahu kapan dan berapa banyak harus restock sebelum stok habis."
  5. AI Business Consultant
     "Tanya langsung kondisi bisnis kamu. Dijawab berdasarkan data aktual."
```

### Section 4: Cara Kerja (How It Works)
```
Konten: alur kerja dalam 4 langkah visual (step-by-step):
  Step 1 → Setup awal produk & stok
  Step 2 → Scan nota / input transaksi
  Step 3 → AI analisis & beri rekomendasi
  Step 4 → Ambil keputusan bisnis lebih cerdas

Tampilkan sebagai timeline horizontal atau vertical dengan ikon dan nomor langkah.
```

### Section 5: Value Proposition / Keunggulan
```
Konten: 3–4 poin keunggulan utama dalam format 2-kolom atau highlight card:
  - "Bukan sekadar pencatat — tapi asisten bisnis"
  - "Cocok untuk nota cetak maupun tulisan tangan"
  - "Setiap rekomendasi disertai penjelasan yang jelas"
  - "Data bisnis kamu, analisis langsung dari data aktual — bukan template"
```

### Section 6: CTA Akhir (Call to Action)
```
Konten:
  - Headline penutup: "Siap kelola bisnis dengan lebih cerdas?"
  - Tombol: "Daftar Sekarang — Gratis" → /register
  - Catatan kecil: "Tidak perlu kartu kredit. Mulai dalam 2 menit."
```

### Footer
```
Konten:
  - Logo + tagline
  - Link: Fitur | Cara Kerja | Tentang | Kontak
  - Hak cipta: © 2024 SPARK. All rights reserved.
```

---

## RULE L-4 — Desain Visual

```
Identitas visual SPARK:
  - Nama produk: SPARK (Smart Profit Analytics & Recommendation Kit)
  - Tema: modern, bersih, profesional namun ramah untuk UMKM
  - Warna: gunakan palet yang memberi kesan kepercayaan dan teknologi
    (biru tua / biru elektrik / aksen kuning/emas sebagai spark/kilat)
  - Tipografi: tegas di headline, bersih di body text
  - Animasi: halus, tidak berlebihan — fokus pada kesan profesional

Hindari:
  - Tampilan yang terlalu teknis / menakutkan untuk pengguna awam
  - Terlalu banyak teks panjang dalam satu section
  - Layout yang terlalu padat tanpa breathing space
```

---

## RULE L-5 — Responsivitas & Aksesibilitas

```
Halaman HARUS responsif untuk:
  - Desktop (>= 1024px): layout penuh, multi-kolom
  - Tablet (768–1023px): layout menyesuaikan, kolom dikurangi
  - Mobile (<= 767px): layout single kolom, tombol full-width

Navbar mobile: tombol Sign In & Sign Up tetap terlihat (tidak disembunyikan di hamburger menu)
  → Karena ini adalah CTA utama halaman.
```

---

## RULE L-6 — Autentikasi & Proteksi Rute

```
Halaman yang membutuhkan login:
  → Jika user belum login dan mencoba akses /dashboard, /stock, /transactions, dsb.
  → Redirect ke /login dengan pesan: "Silakan masuk untuk melanjutkan."
  → Setelah login berhasil, redirect kembali ke halaman yang dituju (intended redirect).

Halaman publik (tidak perlu login):
  → / (landing page)
  → /login
  → /register
```

---

## Batasan & Pengecualian

- ❌ Jangan tampilkan data bisnis atau dashboard di halaman publik.
- ✅ Landing page boleh menampilkan mockup/screenshot dashboard sebagai ilustrasi.
- ✅ Animasi ringan pada hero dan section diperbolehkan untuk meningkatkan kesan profesional.
- ❌ Jangan redirect otomatis ke login jika user membuka landing page langsung (/).

---

*Rules ini berlaku untuk modul Landing Page pada sistem Google Antigravity / SPARK.*
*Versi: 1.0 | Modul: Landing Page & Routing*
