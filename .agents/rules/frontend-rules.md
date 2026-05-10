---
trigger: always_on
---

# SPARK — Frontend Rules
**React · Mobile-First · Antigravity UI**

---

## Core Principles

The frontend serves non-technical small business owners. Every decision must prioritize:
- **Clarity** over cleverness
- **Speed** over animation
- **Trust** over impressiveness

---

## Design System — Antigravity Theme

### Color Palette

```css
:root {
  /* Backgrounds */
  --bg-base:       #0F172A;   /* Deep space — main background */
  --bg-surface:    #1E293B;   /* Card / panel surface */
  --bg-elevated:   #334155;   /* Elevated elements, modals */

  /* Accents */
  --accent-cyan:   #22D3EE;   /* Primary CTA (Scan Nota button) */
  --accent-purple: #A78BFA;   /* AI Insight indicators */
  --accent-green:  #34D399;   /* Positive metrics (profit, stock OK) */
  --accent-red:    #F87171;   /* Warnings (low stock, high expense) */

  /* Text */
  --text-primary:  #F1F5F9;   /* Main readable text */
  --text-muted:    #94A3B8;   /* Labels, subtitles */
  --text-disabled: #475569;   /* Inactive states */

  /* Glow effects (use sparingly) */
  --glow-cyan:     0 0 20px rgba(34, 211, 238, 0.3);
  --glow-purple:   0 0 20px rgba(167, 139, 250, 0.3);
}
```

### Typography Rules

- **Minimum body font size:** 16px (never smaller on mobile)
- **Heading font size:** 20px+ for section headers
- **High contrast only:** text must pass WCAG AA contrast ratio (4.5:1 minimum)
- **No italic for important info** — hard to read quickly under stress

### Glow & Neon Usage

Glow effects are only for:
1. The **"Scan Nota"** button (cyan glow)
2. **AI Insight cards** (purple glow border)
3. **Active navigation** item

**Never** apply glow to: body text, data tables, error messages, form fields.

---

## Mobile-First Rules

```css
/* Always write mobile styles first */
.component { /* 375px default */ }

@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

- Minimum touch target: **48×48px** for all buttons and interactive elements
- Bottom navigation bar on mobile (thumb-reachable)
- No hover-only interactions — all actions must work on touch

---

## PWA Requirements

Implement Service Workers so the app can:
- Be installed on the user's home screen
- Cache the dashboard for offline viewing (read-only when offline)
- Show a friendly offline banner, not a blank screen

---

## State Management

Use **Zustand** for global state. Keep it lean:

```
Store slices:
├── auth          → user session, JWT token
├── business      → business context (products, stock levels)
├── transactions  → recent transactions list
└── ui            → loading states, active modal
```

Never store sensitive financial data in `localStorage`.

---

## UI Copy Rules — Plain Language Only

| ❌ Don't write | ✅ Write instead |
|---------------|-----------------|
| "LLM Reasoning Processing..." | "AI is reading your receipt..." |
| "Invoke OCR Pipeline" | "Scan Receipt" |
| "Context Aggregation Complete" | "Your data is ready" |
| "Rule-based trigger fired" | "We noticed something" |
| "JSON parsing error" | "We couldn't read that receipt. Please check the image." |

**Rule:** If you're unsure, read it out loud. If it sounds like a computer wrote it, rewrite it.

---

## Component Checklist

Before shipping any component, verify:

- [ ] Works on 375px screen width
- [ ] Touch targets are ≥ 48px
- [ ] Loading state is handled (skeleton or spinner)
- [ ] Error state is handled with a human-readable message
- [ ] Empty state is handled (not just a blank space)
- [ ] Uses CSS variables from the design system (no hardcoded colors)
- [ ] No jargon in labels, buttons, or error messages

---

## Key Screens & Their Purpose

### 1. Baseline Setup (Onboarding)
- User inputs: product list, prices, initial stock, categories
- Must feel simple — like filling out a paper form, but faster
- Progress indicator so users know how far along they are

### 2. Scan Receipt (Core Action)
- Large, prominent "Scan / Upload Receipt" button with cyan glow
- Camera capture or file upload (both must work)
- Shows AI extraction result in an editable form before saving

### 3. Validation Screen (Human-in-the-Loop)
- Shows AI-parsed data: item name, qty, price, total
- Every field is editable
- Clear "Confirm & Save" and "Edit" buttons
- Warning if totals don't add up

### 4. Dashboard
- Top: key metrics (Today's Revenue, Profit, Expenses)
- Middle: AI Insight cards with purple glow border
- Bottom: Recent transactions list
- Must load in under 5 seconds

### 5. AI Consultant Chat
- Chat bubbles — user on right, AI on left
- AI responses always reference actual data ("Based on your sales this week...")
- Typing indicator while AI is thinking
- Suggested questions to help users get started
