# 🎨 SPARK Redesign — Part 1: Foundation & Komponen
> Bagian 1 dari 2. Lanjutkan dengan `disain-2-halaman.md` untuk detail setiap halaman.

---

## 🧠 Konteks Brand

**Produk:** SPARK Business AI Consulting  
**Target:** Pemilik UKM Indonesia — pakai AI untuk manajemen bisnis  
**Tone:** Cerdas · Modern · Hangat · Lokal tapi global  
**Logo:** Huruf "S" 3D biru tua + percikan bintang emas — energi & ide

**Halaman yang di-redesign:** Login, Dashboard, AI Chat, Scan Nota, Produk, Pengaturan

---

## 🌈 Design Token — CSS Variables

Taruh di `:root` dan `[data-theme="light"]`:

```css
:root {
  /* BRAND */
  --spark-navy:      #0D1B3E;
  --spark-blue:      #1A3A6E;
  --spark-blue-mid:  #2563EB;
  --spark-cyan:      #06B6D4;
  --spark-gold:      #F59E0B;
  --spark-amber:     #FCD34D;

  /* DARK MODE (default) */
  --bg-base:         #0A0F1E;
  --bg-surface:      #111827;
  --bg-surface-2:    #1A2235;
  --bg-border:       #1E2D45;
  --bg-hover:        #1F2E48;

  --text-primary:    #F0F4FF;
  --text-secondary:  #94A3B8;
  --text-muted:      #475569;
  --text-accent:     #38BDF8;

  --color-success:   #10B981;
  --color-danger:    #F43F5E;
  --color-warning:   #F59E0B;

  /* GRADIENT */
  --gradient-spark:   linear-gradient(135deg, #06B6D4 0%, #2563EB 50%, #7C3AED 100%);
  --gradient-gold:    linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
  --gradient-surface: linear-gradient(145deg, #111827 0%, #1A2235 100%);

  /* GLOW */
  --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.35);
  --glow-blue: 0 0 30px rgba(37, 99, 235, 0.3);
  --glow-gold: 0 0 20px rgba(245, 158, 11, 0.4);

  /* TYPOGRAPHY */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* RADIUS */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* SHADOW */
  --shadow-card:  0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2);
  --shadow-float: 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
  --shadow-inset: inset 0 1px 0 rgba(255,255,255,0.05);

  /* TRANSITION */
  --ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;

  /* SPACING */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
}

[data-theme="light"] {
  --bg-base:        #F0F4FF;
  --bg-surface:     #FFFFFF;
  --bg-surface-2:   #EBF0FB;
  --bg-border:      #D1DCF0;
  --bg-hover:       #E2EAFC;
  --text-primary:   #0D1B3E;
  --text-secondary: #3B4B6B;
  --text-muted:     #7A8DB0;
  --text-accent:    #2563EB;
  --shadow-card:    0 2px 16px rgba(13,27,62,0.08), 0 1px 3px rgba(13,27,62,0.06);
  --shadow-float:   0 8px 32px rgba(13,27,62,0.12);
}
```

---

## 🔤 Tipografi

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Element | Font | Weight | Size | Notes |
|---------|------|--------|------|-------|
| H1 | Plus Jakarta Sans | 800 | 2.5rem | letter-spacing: -0.03em |
| H2 | Plus Jakarta Sans | 700 | 1.75rem | letter-spacing: -0.02em |
| H3 | Plus Jakarta Sans | 600 | 1.25rem | — |
| Body | DM Sans | 400 | 0.9375rem | line-height: 1.6 |
| Label | DM Sans | 500 | 0.8125rem | uppercase, tracking wide |
| Data/Rp | JetBrains Mono | 500–700 | varies | semua angka rupiah & metrik |

---

## ✨ Animasi

```css
/* Page load reveal */
@keyframes sparkReveal {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Logo spark berkedip */
@keyframes sparkPulse {
  0%, 100% { filter: drop-shadow(var(--glow-gold)); opacity: 1; }
  50%       { filter: drop-shadow(0 0 8px rgba(245,158,11,0.8)); opacity: 0.85; }
}

/* Shimmer skeleton */
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}

/* AI typing dots */
@keyframes aiDot {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40%           { transform: scale(1.2); opacity: 1; }
}

/* Sidebar active indicator */
@keyframes slideIn {
  from { width: 0; opacity: 0; }
  to   { width: 3px; opacity: 1; }
}
```

```javascript
// Stagger children on mount
document.querySelectorAll('[data-stagger]').forEach(parent => {
  [...parent.children].forEach((child, i) => {
    child.style.animationDelay = `${i * 80}ms`;
    child.classList.add('animate-reveal');
  });
});

// Theme toggle
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('spark-theme', next);
}

// Init theme
const saved = localStorage.getItem('spark-theme');
const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.dataset.theme = saved || system;
```

---

## 🧩 Komponen Shared

### Card
```css
.card {
  background: var(--gradient-surface);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card), var(--shadow-inset);
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-base) var(--ease-spring),
              box-shadow var(--duration-base) var(--ease-smooth);
}
.card::before { /* Dekoratif glow pojok kiri atas */
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 60px; height: 60px;
  border-radius: 0 0 var(--radius-xl) 0;
  background: var(--gradient-spark);
  opacity: 0.07;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-float), var(--glow-cyan);
}
```

### Button
```css
.btn-primary {
  background: var(--gradient-spark);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  padding: 12px 28px;
  font: 600 0.9375rem var(--font-display);
  box-shadow: var(--glow-blue);
  transition: all var(--duration-base) var(--ease-spring);
}
.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--glow-cyan), 0 8px 24px rgba(37,99,235,0.4);
}
.btn-primary:active { transform: scale(0.98); }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--bg-border);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  transition: all var(--duration-fast) var(--ease-smooth);
}
.btn-ghost:hover {
  border-color: var(--spark-cyan);
  color: var(--text-accent);
  background: rgba(6, 182, 212, 0.08);
}
```

### Input
```css
.input {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--bg-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 12px 16px;
  font: 400 0.9375rem var(--font-body);
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  width: 100%;
}
.input:focus {
  border-color: var(--spark-cyan);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
  outline: none;
}
```

### Badge
```css
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font: 500 0.75rem var(--font-body);
  letter-spacing: 0.03em;
}
.badge-success { background: rgba(16,185,129,0.15); color: #10B981; }
.badge-danger  { background: rgba(244,63,94,0.15);  color: #F43F5E; }
.badge-info    { background: rgba(6,182,212,0.15);  color: #06B6D4; }
.badge-ai      { background: var(--gradient-spark); color: white; }
.badge-ocr     { background: rgba(124,58,237,0.15); color: #8B5CF6; }
```

### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-surface) 25%,
    var(--bg-hover) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

### Toast
```
Posisi: top-right, gap 8px antar toast
Style: glassmorphism, border-radius var(--radius-md)
Auto dismiss: 4 detik
Animasi masuk: slide dari kanan + fade
Animasi keluar: slide ke kanan + fade
Varian: success (green) | error (red) | info (cyan) | warning (amber)
```

---

## 🖥️ Layout Utama

### Sidebar (220px → collapse 64px)
```
Background: var(--bg-surface) + backdrop-filter blur(20px)
Border kanan: 1px solid var(--bg-border)

Logo area:
  - Icon ⚡ animasi sparkPulse + teks "SPARK"
  - Font: Plus Jakarta Sans 700, var(--spark-cyan)

Nav items (padding 10px 16px, radius var(--radius-md)):
  - Default: icon + label, text-secondary
  - Hover: bg rgba(6,182,212,0.08), translateX(4px), text-accent
  - Active: bg var(--bg-hover), border-left 3px var(--spark-cyan),
            text-accent, icon glow cyan

User info (bottom, separated hairline border):
  - Avatar gradient circle (inisial) + nama + role text-muted
```

### Topbar (56px)
```
Kiri:   Breadcrumb / page title — Plus Jakarta Sans 600
Tengah: Search bar glassmorphism + shortcut hint "⌘K"
Kanan:  Notif bell (badge ping merah) | Theme toggle (☀️/🌙 rotate anim) | Avatar
```

### Responsive
```
> 1024px : Sidebar full 220px
768–1024px: Sidebar icon-only 64px
< 768px  : Bottom navigation bar (5 icon)
```

---

## ♿ Aksesibilitas

- Focus visible: `outline: 2px solid var(--spark-cyan); outline-offset: 2px`
- Kontras warna: minimal WCAG AA (4.5:1 teks normal)
- `aria-label` wajib pada semua icon-only button
- `prefers-reduced-motion`: matikan animasi non-essential
- `prefers-color-scheme`: deteksi otomatis, simpan ke localStorage

---

## ✅ Checklist Fase 1 & 2 (Foundation)

- [ ] Setup CSS variables dark + light mode
- [ ] Import font stack (Plus Jakarta Sans, DM Sans, JetBrains Mono)
- [ ] Bangun: Button, Input, Card, Badge, Toast, Skeleton
- [ ] Theme toggle dengan localStorage
- [ ] Sidebar (collapse, active state, animasi)
- [ ] Topbar (search, notif, theme toggle, avatar)
- [ ] Responsive layout wrapper + bottom nav mobile

---
*Part 1/2 — Lanjut ke `disain-2-halaman.md` untuk detail setiap halaman*
