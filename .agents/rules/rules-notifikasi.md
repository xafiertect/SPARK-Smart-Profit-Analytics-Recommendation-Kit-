# Rules Agent: Sistem Notifikasi

## Konteks
Bagian: **Notifikasi Aplikasi**
Modul terkait: Stok Produk, Scan Nota OCR, Manajemen Barang

---

## Tujuan
Membuat sistem notifikasi yang **dapat ditekan / diklik**, menampilkan detail notifikasi, serta mengirim notifikasi otomatis untuk kondisi-kondisi penting: stok di bawah minimum, produk baru dari nota belum dikonfigurasi, dan produk belum terdaftar di stok.

---

## RULE N-1 — Notifikasi Harus Bisa Ditekan (Interaktif)

```
SETIAP notifikasi yang ditampilkan di aplikasi HARUS:
  - Dapat diklik / ditekan (tappable / clickable)
  - Membuka panel detail atau halaman yang relevan
  - Menampilkan informasi lengkap terkait notifikasi tersebut
  - Menyediakan tombol aksi langsung (CTA) di dalam detail notifikasi

DILARANG menampilkan notifikasi yang hanya sebagai teks statis
  tanpa aksi atau navigasi apapun.
```

**Struktur notifikasi interaktif:**

| Elemen        | Keterangan                                              |
|---------------|---------------------------------------------------------|
| Ikon & Label  | Jenis notifikasi (Stok, Nota, Produk Baru, dll.)        |
| Judul         | Ringkasan singkat masalah                               |
| Waktu         | Kapan notifikasi dibuat                                 |
| Pratinjau     | 1–2 baris info relevan                                  |
| Tombol Aksi   | Langsung mengarah ke halaman terkait (lihat detail, edit, dll.) |
| Status        | Belum dibaca / Sudah dibaca / Sudah ditangani           |

**Saat notifikasi ditekan:**
```
TAMPILKAN halaman/panel detail notifikasi berisi:
  - Deskripsi lengkap kondisi yang memicu notifikasi
  - Data terkait (nama produk, jumlah stok, harga, dsb.)
  - Tombol aksi primer  → misal: "Tambah Stok", "Atur Harga Beli", "Edit Produk"
  - Tombol aksi sekunder → misal: "Abaikan", "Tandai Selesai"
  - Riwayat: apakah notifikasi ini sudah pernah ditangani sebelumnya
```

---

## RULE N-2 — Notifikasi Stok di Bawah Minimum

```
JIKA jumlah stok produk <= stok_minimal yang telah ditetapkan
MAKA kirim notifikasi dengan prioritas: ⚠️ PERINGATAN
```

**Isi notifikasi:**
```
Judul   : "Stok [nama_produk] Hampir Habis"
Pesan   : "Stok saat ini: [jumlah_stok] [satuan].
           Batas minimal: [stok_minimal] [satuan].
           Segera lakukan pengadaan stok."
Aksi    : → Tombol "Tambah Stok Sekarang"
           → Tombol "Lihat Detail Produk"
```

**Aturan pengiriman:**
- Notifikasi dikirim **satu kali** saat stok pertama kali menyentuh atau melewati batas minimal.
- Notifikasi **tidak dikirim ulang** sampai stok sempat naik di atas batas minimal, lalu turun lagi.
- Jika stok = 0, eskalasi ke prioritas 🔴 KRITIS dengan label "Stok Habis".

---

## RULE N-3 — Notifikasi Produk dari Nota Belum Dikonfigurasi

```
JIKA ada produk hasil scan nota OCR yang:
  - Harga beli masih 0 atau kosong / null
  - ATAU stok_minimal belum diatur (null)
MAKA kirim notifikasi dengan prioritas: 📋 PERLU TINDAKAN
```

**Isi notifikasi:**
```
Judul   : "Produk [nama_produk] Belum Dikonfigurasi"
Pesan   : "Produk ini baru ditambahkan dari nota scan.
           Harga beli: [kosong / belum diisi]
           Stok minimal: [belum diatur]
           Silakan lengkapi data produk."
Aksi    : → Tombol "Atur Harga Beli"
           → Tombol "Tentukan Stok Minimal"
           → Tombol "Edit Produk Lengkap"
```

**Aturan pengiriman:**
- Notifikasi dikirim **segera** setelah produk baru terdaftar via auto-OCR.
- Notifikasi **otomatis ditutup / selesai** jika harga beli dan stok minimal sudah diisi.
- Jika setelah 3 hari belum dikonfigurasi, kirim **pengingat ulang** sekali.

---

## RULE N-4 — Notifikasi Produk pada Nota Belum Ada di Stok (Produk Baru)

```
JIKA hasil scan nota mengandung produk yang belum terdaftar di stok
MAKA kirim notifikasi dengan prioritas: 🆕 PRODUK BARU
```

**Isi notifikasi:**
```
Judul   : "Produk Baru Terdeteksi dari Nota"
Pesan   : "Ditemukan [jumlah] produk baru dari nota tanggal [tanggal_nota]:
           - [nama_produk_1]
           - [nama_produk_2]
           - dst.
           Produk telah otomatis didaftarkan dengan stok 0.
           Lengkapi data produk agar sistem berjalan optimal."
Aksi    : → Tombol "Lihat & Lengkapi Semua Produk Baru"
           → Tombol "Nanti Saja"
```

**Aturan pengiriman:**
- Jika satu nota mengandung beberapa produk baru → **gabung dalam satu notifikasi** (tidak terpisah per produk).
- Notifikasi produk baru dari nota berbeda dikirim secara terpisah.

---

## RULE N-5 — Manajemen Status Notifikasi

```
Setiap notifikasi memiliki status:
  [BARU]       → belum dibuka sama sekali
  [DIBACA]     → sudah ditekan/dibuka tapi belum ditindaklanjuti
  [SELESAI]    → aksi sudah dilakukan (otomatis atau manual)
  [DIABAIKAN]  → user memilih untuk mengabaikan

Agent HARUS:
  - Menampilkan badge jumlah notifikasi [BARU] di ikon notifikasi
  - Memisahkan tampilan antara notifikasi aktif dan notifikasi selesai/diabaikan
  - Menyimpan riwayat semua notifikasi minimal 30 hari
```

---

## RULE N-6 — Prioritas & Urutan Tampil

```
Urutkan notifikasi dari prioritas tertinggi:
  1. 🔴 KRITIS       — Stok habis (= 0)
  2. ⚠️  PERINGATAN  — Stok di bawah minimal
  3. 📋 PERLU TINDAKAN — Produk belum dikonfigurasi (harga beli / stok minimal)
  4. 🆕 PRODUK BARU  — Produk dari nota belum terdaftar
  5. ℹ️  INFO         — Notifikasi umum lainnya
```

---

## Alur Ringkas Notifikasi

```
Kondisi terpenuhi (stok rendah / produk baru / belum dikonfigurasi)
     │
     ▼
Buat entri notifikasi di database
  (judul, pesan, tipe, prioritas, status=BARU, waktu)
     │
     ▼
Tampilkan badge di ikon notifikasi
     │
     ▼
User menekan ikon notifikasi
     │
     ▼
Tampilkan daftar notifikasi (diurutkan by prioritas & waktu)
     │
     ▼
User menekan salah satu notifikasi
     │
     ▼
Tampilkan halaman detail notifikasi + tombol aksi
     │
     ▼
User menekan tombol aksi → navigasi ke halaman terkait
Status notifikasi → [DIBACA] atau [SELESAI]
```

---

## Batasan & Pengecualian

- ❌ Agent **tidak boleh** mengirim notifikasi duplikat untuk kondisi yang sama dalam waktu < 24 jam (kecuali kondisi berubah).
- ✅ Notifikasi KRITIS (stok = 0) boleh mengirim push notification ke perangkat jika fitur tersedia.
- ✅ User dapat mengatur preferensi notifikasi (aktifkan/nonaktifkan per jenis).
- ❌ Agent **tidak boleh** menghapus notifikasi secara otomatis; hanya mengubah status.

---

*Rules ini berlaku untuk modul Notifikasi pada sistem Google Antigravity.*
*Versi: 1.0 | Modul: Notifikasi*
