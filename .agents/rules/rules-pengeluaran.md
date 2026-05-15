# Rules Agent: Sistem Pengeluaran

## Konteks
Bagian: **Manajemen Pengeluaran**
Modul terkait: Stok Produk, Tambah Stok, Keuangan

---

## Tujuan
Mengatur sistem pencatatan pengeluaran secara otomatis maupun manual. Pengeluaran default dihitung dari rumus `jumlah_stok_ditambah × harga_beli`, namun **selalu dapat diubah secara custom** oleh pengguna karena kondisi lapangan bisa berbeda dari data yang diinput.

---

## RULE E-1 — Pengeluaran Otomatis Saat Tambah Stok

```
KETIKA user menambah stok produk
MAKA sistem otomatis membuat entri pengeluaran dengan:

  nama_pengeluaran  = "Pembelian Stok: [nama_produk]"
  jumlah_stok       = [jumlah yang ditambahkan]
  harga_beli        = [harga beli produk saat itu]
  total_default     = jumlah_stok × harga_beli
  total_aktual      = total_default  ← (bisa diubah, lihat RULE E-2)
  tanggal           = [tanggal penambahan stok]
  kategori          = "Pembelian Stok"
  sumber            = "auto-tambah-stok"
  status            = "draft"  ← menunggu konfirmasi user
```

**Catatan:**
- Entri pengeluaran dibuat berstatus **draft** terlebih dahulu.
- User harus **konfirmasi atau ubah** sebelum pengeluaran tersimpan permanen.
- Jika harga beli produk masih 0 atau kosong, total default = 0 dan sistem menampilkan peringatan: *"Harga beli belum diatur. Isi harga beli atau masukkan total pengeluaran secara manual."*

---

## RULE E-2 — Pengeluaran Dapat Diubah Secara Custom

```
PADA form konfirmasi pengeluaran, user HARUS dapat:
  - Melihat rumus default: [jumlah_stok] × [harga_beli] = [total_default]
  - Mengubah total_aktual menjadi nilai apapun (custom)
  - Menambahkan catatan alasan perubahan (opsional tapi dianjurkan)

SISTEM tidak boleh memblokir atau memperingatkan sebagai error
  jika total_aktual ≠ total_default.
  → Perbedaan ini VALID karena alasan bisnis yang sah.
```

**Contoh skenario yang valid:**

| Skenario | Stok Ditambah | Harga Beli | Default | Custom Aktual | Alasan |
|---|---|---|---|---|---|
| Beli 5, input 5 | 5 | Rp 10.000 | Rp 50.000 | Rp 50.000 | Sesuai |
| Input 5, beli hanya 3 | 5 | Rp 10.000 | Rp 50.000 | Rp 30.000 | Sisa 2 belum dibeli |
| Beli 5, dapat diskon | 5 | Rp 10.000 | Rp 50.000 | Rp 42.000 | Diskon dari supplier |
| Stok lama belum diinput | 5 | Rp 10.000 | Rp 50.000 | Rp 0 | Stok sudah ada, lupa input |

---

## RULE E-3 — Struktur Form Pengeluaran

```
Form tambah / edit pengeluaran HARUS mengandung field berikut:
```

| Field | Tipe | Keterangan |
|---|---|---|
| Nama Pengeluaran | Teks | Default: "Pembelian Stok: [nama produk]", bisa diubah |
| Tanggal | Tanggal | Default: hari ini, bisa diubah |
| Kategori | Pilihan | Pembelian Stok / Operasional / Lainnya / (custom) |
| Produk Terkait | Referensi | Link ke produk jika pengeluaran terkait stok |
| Jumlah Stok Ditambah | Angka | Readonly (dari input stok), tampil sebagai info |
| Harga Beli per Unit | Angka | Readonly (dari data produk), tampil sebagai info |
| Total Default | Angka | Readonly — hasil `jumlah × harga_beli`, hanya tampilan |
| **Total Aktual** | **Angka** | **Dapat diubah bebas oleh user** |
| Selisih | Angka | Otomatis: `total_aktual - total_default` (tampil jika berbeda) |
| Catatan | Teks panjang | Opsional, untuk menjelaskan alasan perbedaan |
| Bukti (opsional) | File/Foto | Upload nota / struk pembelian |

---

## RULE E-4 — Pengeluaran Manual (Tanpa Tambah Stok)

```
User HARUS dapat menambah pengeluaran secara manual kapan saja
  tanpa harus melalui proses tambah stok.

Gunakan form yang sama (RULE E-3) dengan:
  - Produk Terkait → opsional (boleh kosong)
  - Jumlah Stok & Harga Beli → tidak ditampilkan jika tidak ada produk terkait
  - Total Default → tidak dihitung (kosong)
  - Total Aktual → diisi manual oleh user
  - Kategori → bebas dipilih
```

**Contoh pengeluaran manual:**
- Biaya listrik toko
- Pembelian perlengkapan toko (kantong, label harga)
- Ongkos kirim supplier
- Servis peralatan

---

## RULE E-5 — Validasi & Konfirmasi Sebelum Simpan

```
SEBELUM menyimpan pengeluaran (dari auto maupun manual):

  JIKA total_aktual ≠ total_default DAN selisih > 20%
  MAKA tampilkan konfirmasi ringan:
    "Total yang dimasukkan berbeda dari perhitungan default
     (default: Rp [total_default], kamu masukkan: Rp [total_aktual]).
     Apakah kamu yakin?"
    → Tombol: "Ya, Simpan" | "Ubah Lagi"

  JIKA total_aktual = 0 DAN total_default > 0
  MAKA tampilkan peringatan:
    "Total pengeluaran adalah Rp 0. Apakah ini benar?"
    → Tombol: "Ya, Rp 0" | "Isi Total"

SISTEM tidak boleh memblokir penyimpanan;
  konfirmasi hanya bersifat informatif, bukan error.
```

---

## RULE E-6 — Riwayat & Laporan Pengeluaran

```
Sistem HARUS menyimpan semua pengeluaran dengan kolom:
  - ID unik pengeluaran
  - Nama pengeluaran
  - Tanggal
  - Kategori
  - Produk terkait (jika ada)
  - Jumlah stok (jika dari tambah stok)
  - Harga beli per unit (jika dari tambah stok)
  - Total default (jika dari tambah stok)
  - Total aktual ← nilai yang dipakai untuk laporan keuangan
  - Selisih (total_aktual - total_default)
  - Catatan
  - Sumber (auto-tambah-stok / manual)
  - Dibuat oleh (user)

Laporan pengeluaran dapat difilter berdasarkan:
  - Rentang tanggal
  - Kategori
  - Produk
  - Sumber (auto / manual)
```

---

## Alur Ringkas: Pengeluaran dari Tambah Stok

```
User menambah stok produk [X] sebanyak [N]
     │
     ▼
Sistem hitung total default: N × harga_beli
     │
     ▼
Tampilkan form konfirmasi pengeluaran (status: draft)
  [Nama] [Tanggal] [Kategori]
  Info: N unit × Rp harga_beli = Rp total_default
  ┌─────────────────────────────────────┐
  │ Total Aktual: [Rp ___________] ✏️  │  ← bisa diubah
  └─────────────────────────────────────┘
  [Catatan opsional]
     │
     ▼
User ubah total atau biarkan default → tekan Simpan
     │
     ├── Jika selisih > 20% → konfirmasi ringan
     │
     ▼
Pengeluaran tersimpan permanen (status: selesai)
Stok produk terupdate
```

---

## Alur Ringkas: Pengeluaran Manual

```
User buka menu Pengeluaran → Tambah Pengeluaran
     │
     ▼
Isi form:
  Nama, Tanggal, Kategori, Total Aktual, Catatan
     │
     ▼
Simpan → Tersimpan di riwayat pengeluaran
```

---

## Batasan & Pengecualian

- ❌ Agent **tidak boleh** menghapus atau mengubah total_aktual yang sudah dikonfirmasi tanpa aksi eksplisit dari user.
- ✅ User dapat mengedit pengeluaran yang sudah tersimpan selama belum masuk periode laporan yang dikunci.
- ✅ Pengeluaran dengan total 0 diperbolehkan (misal: stok pemberian / bonus supplier).
- ❌ Agent **tidak boleh** menyamakan total_aktual dengan total_default secara otomatis tanpa konfirmasi user.
- ✅ Jika harga beli produk diubah setelah pengeluaran dibuat, pengeluaran lama **tidak ikut berubah** (nilai historis tetap).

---

*Rules ini berlaku untuk modul Pengeluaran pada sistem Google Antigravity.*
*Versi: 1.0 | Modul: Pengeluaran*
