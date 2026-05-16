# 🎨 SPARK Redesign — Part 3: AI Chat, Scan Nota, Produk, Pengaturan
> Bagian 3 dari 3. Pastikan sudah baca Part 1 & 2.

---

## 💬 AI Chat

**Konsep:** Premium AI assistant — berkarakter, terasa "hidup", bukan chatbot biasa.

### Header
```
Avatar SPARK AI : circle gradient spark + icon ✦ putih
Nama            : "SPARK AI" — Plus Jakarta Sans 700
Status          : "● Online" — dot hijau animasi ping
Subtitle        : "Siap membantu bisnis kamu" — text-muted
Kanan           : tombol "Bersihkan Chat" (icon trash, ghost, konfirmasi modal)
```

### Welcome State (chat kosong)
```
Center layout, padding besar:
  Icon SPARK 64px — animasi rotate slow + glow pulse bergantian
  "Halo! Saya SPARK AI 👋" — H2
  "Tanyakan apa saja tentang bisnis kamu." — text-secondary

Suggestion Pills (grid 2 kolom, stagger reveal dari bawah):
  "Berapa keuntungan saya hari ini?"    | "Produk apa yang paling laris?"
  "Cara meningkatkan penjualan?"        | "Tips marketing bisnis kecil?"
  "Stok mana yang perlu diisi?"         | "Cara kelola cash flow yang baik?"

Style pill: border 1px var(--bg-border), rounded-full, pad 10px 18px
Hover: border cyan, text-accent, scale 1.02, glow subtle
```

### Message Bubbles
```
USER (kanan):
  bg: var(--gradient-spark) | color: white
  border-radius: 18px 18px 4px 18px | max-width: 70%
  timestamp: muncul saat hover

AI (kiri):
  bg: var(--bg-surface-2) | border: 1px solid var(--bg-border)
  border-radius: 18px 18px 18px 4px
  Avatar AI 24px di kiri luar bubble
  Copy button pojok kanan bawah — muncul saat hover
  Render: bold, code block (JetBrains Mono bg gelap), list

Typing indicator:
  3 dot dalam bubble AI style
  Animasi: scale 0.8→1.2→0.8, delay 0/150/300ms
  Teks: "SPARK AI sedang mengetik..." — italic text-muted 12px
```

### Input Area
```
Container: rounded-xl, border var(--bg-border), bg var(--bg-surface)
Textarea  : auto-resize max 5 baris, placeholder "Tanya sesuatu..."
Send btn  : circle 40px, gradient spark, icon arrow-up
            hover: glow cyan + scale 1.05
            disabled: opacity 60%, cursor not-allowed
Hint      : "Enter kirim · Shift+Enter baris baru" — text-muted 11px
```

---

## 📷 Scan Nota

**Konsep:** Satu tujuan utama — upload, scan, simpan. Sesimpel itu.

### Header
```
Icon 📸 dalam circle gradient, animasi float (translateY ±4px loop)
"Scan Nota"   — H1
Subtitle      — text-secondary
```

### Upload Zone
```
Dashed border, radius var(--radius-xl), min-height 220px
bg: var(--bg-surface) + dot pattern 2% opacity

Default:
  Icon upload 32px + "Upload Foto Nota" bold
  "Seret foto ke sini atau klik pilih file" — text-muted

Drag-over state:
  Border solid cyan 2px | bg rgba(6,182,212,0.06) | scale 1.02
  Teks: "Lepaskan untuk upload! 🎯"
  Animated dashed border (background-position scroll)

Setelah upload:
  Preview gambar object-fit contain, max-height 280px, rounded-lg
  Tombol ✕ "Ganti Foto" — pojok kanan atas, merah kecil
  Nama file + ukuran — text-muted 12px di bawah
```

### Tombol & Tips
```
Tombol "Scan Nota":
  Full width, h-52px, gradient spark, rounded-full, icon kamera kiri
  Loading: progress bar animated dalam tombol + "AI sedang membaca..."
  Selesai: ✓ hijau 1 detik → scroll ke hasil

Tips (3 item inline):
  🌟 Pencahayaan baik  📄 Nota rata  📐 Nota full frame
  text-muted 12px, no card — simpel saja
```

### Hasil Scan
```
Card slide-up: opacity 0 + translateY(20px) → normal, 400ms

Header: "✅ Nota Berhasil Dibaca" — color-success
Tabel: Produk | Qty | Harga Satuan | Subtotal
  Font angka: JetBrains Mono | border antar row: 1px var(--bg-border)
Total bawah: JetBrains Mono 700, 1.5rem, text-primary

Actions:
  "Simpan ke Transaksi" — primary full width
  "Scan Lagi" — ghost
```

---

## 📦 Produk

**Konsep:** Manajemen cepat — filter, cari, tambah dalam hitungan detik.

### Header & Controls
```
Kiri : "📦 Produk" H1 + badge jumlah total
Kanan: "+ Tambah Produk" — primary button

Baris 2:
  Search bar (debounce 300ms) | Dropdown filter: Semua/Aktif/Habis
  Toggle Grid ⊞ / List ☰
```

### Product Card (Grid 3 kolom)
```
Gambar 1:1, object-fit cover, rounded-lg
  Fallback: gradient + inisial nama produk (2 huruf)
Nama  : Plus Jakarta Sans 600
Harga : JetBrains Mono 600, var(--spark-cyan)
Stok badge:
  ≥ 10 → hijau "Tersedia"
  1–9  → amber "Menipis ⚠️"
  0    → merah "Habis"

Hover card:
  Overlay gelap + 2 tombol muncul: ✏️ Edit | 🗑️ Hapus
```

### Empty State
```
SVG custom (kotak + tanda +, warna brand)
"Belum ada produk"
"Tambahkan produk pertama kamu untuk mulai melacak stok"
Tombol "+ Tambah Produk" langsung di sini
```

### Modal / Drawer Tambah & Edit
```
Drawer slide dari kanan (translateX 100%→0) atau modal scale(0.9→1)
Backdrop gelap + blur

Fields:
  Nama Produk*  | Harga Jual (Rp)* | Harga Modal (Rp)
  Stok Awal*    | Kategori (tag)   | Foto Produk (upload preview)

Error: shake + border merah + pesan di bawah field
Footer: "Batal" ghost | "Simpan Produk" primary
```

---

## ⚙️ Pengaturan

**Konsep:** Simpel, trustworthy, clear hierarchy.

### Profile Card
```
Avatar 64px: inisial dalam circle gradient spark
  hover → overlay icon kamera (upload foto)
Nama usaha  : Plus Jakarta Sans 700
Email       : text-muted
Badge versi : "SPARK v1.0.0" — gradient gold, rounded-full
```

### Info Rows & Preferensi
```
Info rows (Nama, Email):
  Label text-muted kiri | Value text-primary kanan
  Hover: bg var(--bg-hover) + icon ✏️ muncul kanan
  Klik → inline edit: input replace teks + ✓ simpan / ✕ batal

Preferensi:
  🌗 Mode Gelap/Terang  → toggle (sync dengan topbar)
  🌐 Bahasa             → select Indonesia / English
  🔔 Notifikasi         → toggle on/off
```

### Danger Zone & Logout Modal
```
Section terpisah:
  border: 1px solid rgba(244,63,94,0.25)
  border-radius: var(--radius-lg), padding 16px
  Label: "⚠️ Zona Bahaya" — text-danger kecil
  Tombol "Keluar" → merah, full width

Modal konfirmasi logout:
  scale-in animasi | backdrop blur
  "Keluar dari SPARK?"
  "Pastikan data kamu sudah tersimpan."
  [Batal — ghost] [Ya, Keluar — danger]
```

---

## ✅ Checklist Part 3

- [ ] AI Chat: welcome state + suggestion pills stagger
- [ ] AI Chat: user & AI bubble, copy hover, timestamp hover
- [ ] AI Chat: typing indicator dots + input auto-resize
- [ ] Scan Nota: drag-drop animated border + preview
- [ ] Scan Nota: tombol progress bar + hasil slide-up
- [ ] Produk: grid + stok badge + hover quick action
- [ ] Produk: drawer/modal + validasi shake
- [ ] Produk: empty state SVG custom
- [ ] Pengaturan: inline edit rows + toggle preferensi
- [ ] Pengaturan: danger zone + logout modal konfirmasi

### Polish Global
- [ ] Stagger reveal semua list & grid
- [ ] Skeleton loading semua async data
- [ ] Toast notification (success/error/info/warning)
- [ ] Keyboard: ⌘K search, Esc tutup modal
- [ ] Aksesibilitas: contrast AA, focus ring, aria-label
- [ ] Test: mobile 375px, tablet 768px, desktop 1280px

---

## 💡 Filosofi Desain

> **"Seperti SPARK — nyalakan, pancarkan, gerakkan."**

Navy dalam = kepercayaan. Cyan & gold = energi AI. Animasi halus = aplikasi yang hidup.
**Lokal dalam bahasa, global dalam kualitas.**

---
*Part 3/3 | SPARK Business AI Consulting | v1.0.0 | 15 Mei 2026*
