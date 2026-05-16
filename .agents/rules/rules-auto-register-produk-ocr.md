# Rules Agent: Auto-Registrasi Produk Baru dari Scan Nota OCR

## Konteks
Bagian: **Manajemen Stok Produk**  
Trigger: Hasil scan nota via OCR mengandung produk yang **belum terdaftar** di database stok.

---

## Tujuan
Ketika sistem mendeteksi produk dari hasil OCR nota yang tidak ditemukan di daftar stok, agent secara otomatis mendaftarkan produk baru dengan nilai default yang aman, lalu mengisi harga jual dari data nota yang discan.

---

## Rules Agent

### RULE 1 — Deteksi Produk Tidak Dikenal

```
JIKA hasil OCR mengandung nama produk
DAN nama produk tersebut TIDAK ditemukan di database stok (fuzzy match < 80%)
MAKA tandai produk sebagai [PRODUK_BARU]
```

**Catatan:**
- Gunakan fuzzy matching (toleransi typo/singkatan) sebelum menyatakan produk tidak dikenal.
- Jika nama produk mirip (≥ 80%) dengan produk yang sudah ada, tanyakan konfirmasi ke pengguna sebelum membuat entri baru.

---

### RULE 2 — Inisialisasi Data Produk Baru

```
UNTUK setiap [PRODUK_BARU] yang terdeteksi:
  - nama_produk     = [nama produk dari hasil OCR]
  - stok            = 0
  - harga_beli      = 0  (atau kosong / null)
  - harga_jual      = [harga dari nota OCR, jika tersedia]
  - satuan          = [satuan dari nota OCR, jika tersedia; jika tidak: "pcs"]
  - status          = "aktif"
  - sumber_entri    = "auto-OCR"
  - tanggal_dibuat  = [tanggal scan nota]
```

**Catatan:**
- Harga jual diambil dari kolom harga pada nota yang discan.
- Jika nota tidak mencantumkan harga jual, isi dengan `null` dan tandai sebagai **perlu review**.
- Harga beli **tidak boleh diambil** dari nota (nota adalah nota penjualan, bukan faktur pembelian).

---

### RULE 3 — Penyimpanan & Notifikasi

```
SIMPAN produk baru ke tabel/koleksi stok produk
TAMPILKAN notifikasi ke pengguna:
  "Produk baru [nama_produk] otomatis didaftarkan dari hasil scan nota.
   Stok: 0 | Harga Beli: - | Harga Jual: [harga_dari_nota]
   Silakan lengkapi data produk jika diperlukan."
TANDAI entri produk baru dengan label/flag: ⚠️ Perlu Verifikasi
```

---

### RULE 4 — Lanjutkan Proses Scan Nota

```
SETELAH produk baru terdaftar,
LANJUTKAN proses input nota OCR seperti biasa
  (produk baru diperlakukan sama seperti produk yang sudah ada)
CATAT transaksi nota ke riwayat tanpa hambatan
```

---

### RULE 5 — Review & Koreksi Manual

```
Agent HARUS menyediakan akses cepat ke halaman edit produk baru
  → Tombol/link "Edit Produk" langsung dari notifikasi
Agent TIDAK BOLEH memblokir proses scan karena produk belum lengkap
Agent HARUS mencatat log: [waktu, nama_produk, sumber_nota, user]
```

---

## Alur Ringkas (Flow)

```
Scan Nota OCR
     │
     ▼
Ekstrak daftar produk dari nota
     │
     ▼
Cocokkan dengan database stok ──── Ditemukan ──▶ Proses normal
     │
  Tidak ditemukan
     │
     ▼
Buat entri produk baru:
  stok = 0
  harga_beli = 0 / kosong
  harga_jual = dari nota
  sumber = "auto-OCR"
     │
     ▼
Simpan ke database stok
     │
     ▼
Tampilkan notifikasi ⚠️ ke user
     │
     ▼
Lanjutkan input transaksi nota
```

---

## Contoh Data Produk yang Dibuat Otomatis

| Field        | Nilai                        |
|--------------|------------------------------|
| Nama Produk  | Minyak Goreng Tropical 2L    |
| Stok         | 0                            |
| Harga Beli   | *(kosong / perlu diisi)*     |
| Harga Jual   | Rp 32.000 *(dari nota)*      |
| Satuan       | botol                        |
| Status       | Aktif                        |
| Sumber Entri | auto-OCR                     |
| Flag         | ⚠️ Perlu Verifikasi           |

---

## Batasan & Pengecualian

- ❌ Agent **tidak boleh** menebak harga beli dari harga jual.
- ❌ Agent **tidak boleh** menambah stok secara otomatis hanya dari scan nota (stok tetap 0).
- ✅ Agent **boleh** menyarankan harga beli berdasarkan riwayat jika fitur analitik tersedia (opsional, perlu konfirmasi user).
- ✅ Jika satu nota mengandung beberapa produk baru, semua didaftarkan sekaligus dalam satu batch.

---

*Rules ini berlaku untuk modul Stok Produk pada sistem Google Antigravity.*  
*Versi: 1.0 | Dibuat: {{ tanggal_hari_ini }}*
