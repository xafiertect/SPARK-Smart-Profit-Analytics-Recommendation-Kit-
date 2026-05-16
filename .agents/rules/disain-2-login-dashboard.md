# 🎨 SPARK Redesign — Part 2: Login & Dashboard
> Bagian 2 dari 3. Baca `disain-1-foundation.md` dulu. Lanjut `disain-3-fitur.md` setelah ini.

---

## 📄 Login Page

**Konsep:** Full-screen split — bukan kotak polos di tengah layar.

### Layout Split 60/40
```
KIRI (60%) — Hero area:
  - Animated particle field (warna cyan & biru, gerak perlahan)
  - Logo SPARK besar, animasi sparkPulse
  - Tagline: "Nyalakan bisnis kamu." — Plus Jakarta Sans 800, 3rem
  - Sub: "AI siap membantu setiap keputusan bisnis" — text-secondary

KANAN (40%) — Form panel:
  - bg: rgba(17,24,39,0.92) + backdrop-filter: blur(24px)
  - border-left: 1px solid rgba(255,255,255,0.08)
  - Vertikal center, padding 48px
```

### Form
```
Logo kecil SPARK (atas)
H2: "Selamat Datang 👋" — Plus Jakarta Sans 700
Subtitle: "Masuk untuk mengelola bisnis kamu" — text-muted

Input Email     → floating label + icon mail
Input Password  → floating label + eye toggle
Button "Masuk"  → gradient spark, full width, h-48px
  loading: shimmer + spinner + "Memproses..."
  error: shake animation (translateX ±6px × 3)

Link "Daftar di sini" → warna spark-cyan, underline hover
```

### Animasi
```
Panel kanan: fade + translateX(30px→0), delay 150ms
Input focus : glow cyan ring 3px
Background  : requestAnimationFrame particle movement
```

---

## 📊 Dashboard

**Konsep:** Command center bisnis — seperti cockpit pilot, bersih + informatif.

### Header
```
"Halo, [Nama] 👋"  — Plus Jakarta Sans 800, 2rem
Tanggal Indonesia  — DM Sans, text-muted
Kanan: AI quick-insight pill badge (jika ada insight aktif)
```

### Stat Cards — 3 Kolom
```
┌─────────────────────────────────────────────────────┐
│ [cyan border]    [green border]    [red border]      │
│ 💳 Pendapatan   📈 Keuntungan    🛒 Pengeluaran      │
│ Rp 65.000       Rp 65.000        Rp 0               │
│ ↑ 12.5%         ↑ 12.5%          — 0.0%             │
│ ▁▂▃▄▅▆▇ (sparkline 7 hari)                          │
└─────────────────────────────────────────────────────┘

Per card:
  - top-border 3px sesuai warna
  - Icon dalam circle gradient
  - Label: 12px uppercase DM Sans 500, text-muted
  - Nilai: JetBrains Mono 700, 2rem
  - % badge: hijau (↑) atau merah (↓)
  - Mini sparkline SVG di bawah nilai
  - Count-up animasi saat masuk viewport (IntersectionObserver)
  - Hover: float up + glow sesuai warna
```

### AI Insights
```
Container: border-left 3px var(--spark-cyan) + bg gradient subtle
Header row:
  kiri → ✨ "AI Insights" + badge "AI" gradient
  kanan → tombol "Cek" (icon refresh berputar saat loading)

State kosong:
  "Belum ada insight. Klik 'Cek' untuk menjalankan analisis AI."
  italic, text-muted

State ada insight:
  List card per insight — icon kontekstual + teks
  Contoh: 💡 "Kopi Arabika terjual 2× lebih banyak minggu ini"
          ⚠️  "Stok Gula tersisa 2 unit — segera restok"
```

### Quick Actions *(tambahan baru)*
```
4 tombol ghost rounded-lg sejajar:
  [+ Catat]  [📷 Scan Nota]  [💬 Tanya AI]  [📦 Produk]
Hover: border cyan + glow subtle + scale 1.02
```

### Transaksi Terbaru
```
Header: "Transaksi Terbaru" + badge jumlah (abu)
"Lihat semua →" link kanan, text-cyan

List item:
  Kiri  → avatar inisial (circle gradient) + nama produk + sub-item
          badge PENJUALAN/PENGELUARAN + badge OCR (ungu, jika dari scan)
          tanggal — text-muted 12px
  Kanan → amount JetBrains Mono (+green / -red)
  Hover → translateX(4px) + bg var(--bg-hover)

Empty state:
  Ilustrasi SVG simpel + "Belum ada transaksi hari ini"
  + tombol "Catat Transaksi Pertama"
```

---

## 🌗 Theme Toggle

```css
[data-theme="dark"]  .icon-moon { display: none; }
[data-theme="light"] .icon-sun  { display: none; }

/* Smooth transition semua element */
*, *::before, *::after {
  transition: background-color 300ms ease,
              border-color 300ms ease,
              color 200ms ease;
}
img, video, canvas { transition: none; }
```

```javascript
// Init + toggle
const THEME_KEY = 'spark-theme';
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = saved ?? system;
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}
initTheme();
```

---

## ✅ Checklist Part 2

- [ ] Login: split layout, animated particle bg, floating label input
- [ ] Login: shake on error, shimmer loading button
- [ ] Dashboard: 3 stat card + sparkline + count-up
- [ ] Dashboard: AI Insights section + tombol Cek
- [ ] Dashboard: Quick Actions row
- [ ] Dashboard: Transaksi list + empty state
- [ ] Theme toggle: sync topbar ↔ pengaturan, persist localStorage

---
*Part 2/3 | Lanjut → `disain-3-fitur.md`*
