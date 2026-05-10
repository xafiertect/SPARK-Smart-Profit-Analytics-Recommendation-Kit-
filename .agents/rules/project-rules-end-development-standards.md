---
trigger: always_on
---

# SPARK — Project Rules & Development Standards
**Smart Profit Analytics & Recommendation Kit**
*For use with Claude Code & AI-assisted development*

---

## What Is SPARK?

SPARK is an **Autonomous SME Financial Assistant** built for small business owners (UMKM) in Indonesia. It combines OCR, LLM reasoning, and a rule-based financial engine to help users record transactions, monitor stock, and receive proactive business recommendations — all without needing technical expertise.

**Core Stack:** React (Frontend) · FastAPI (Backend) · PostgreSQL (Database)

---

## Golden Rules (Always Follow These)

1. **Mobile-first, always.** Start every UI at 375px wide. Scale up from there.
2. **No jargon in the UI.** If a grandma can't understand it, rewrite it.
3. **Async everything.** No blocking calls on the main thread — ever.
4. **Human confirms before save.** AI output must pass through a user validation step before hitting the database.
5. **Isolate by tenant.** One user must never see another user's data — enforce this at the database level.
6. **Explain every AI decision.** Every recommendation must include a plain-language reason.
7. **Fail gracefully.** If OCR fails or the LLM is slow, fall back to manual input — never crash the user flow.

---

## Project Structure

```
spark/
├── frontend/          # React app (mobile-first, PWA)
├── backend/           # FastAPI app (async, modular)
│   ├── routers/       # One file per feature domain
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic (OCR, LLM, agent)
│   └── core/          # Auth, config, database connection
├── migrations/        # Alembic migration files
└── docker-compose.yml # Local dev environment
```

---

## Git Branching Strategy

```
main        ← production-ready only
dev         ← integration branch (PRs merge here first)
feature/*   ← individual feature work (e.g. feature/ocr-pipeline)
fix/*       ← bug fixes
```

**Rules:**
- Never commit directly to `main`
- Every feature branch must be reviewed before merging to `dev`
- Use descriptive branch names: `feature/ai-agent-trigger`, not `feature/new-stuff`

---

## Environment Setup

Use Docker Compose for local development. All services run in containers:

```yaml
services:
  backend:   FastAPI on port 8000
  db:        PostgreSQL on port 5432 (internal only)
  frontend:  React dev server on port 3000
```

For secure remote access to staging/production:
- Use **Tailscale** (preferred) or SSH tunneling via a Bastion Host
- Never expose the database port to the public internet

---

## Day-by-Day Implementation Plan

| Day | Focus | Expected Output |
|-----|-------|-----------------|
| 1 | Project setup, auth (JWT), Docker, DB schema | Repo ready, auth working |
| 2–3 | Baseline UI (product/stock input), CRUD endpoints | Mobile UI + backend API live |
| 4 | OCR pipeline + LLM parsing + validation screen | Scan nota → structured JSON |
| 5–6 | Financial engine + AI Agent (rule triggers + LLM) | Auto recommendations working |
| 7 | Dashboard, AI Consultant chat, end-to-end testing | Full system demo-ready |

---

## Key Performance Targets

| Metric | Target |
|--------|--------|
| OCR accuracy (printed receipt) | ≥ 85% |
| OCR accuracy (handwritten) | ≥ 70% |
| Transaction input time vs manual | 50% faster |
| Dashboard + agent load time | < 5 seconds |
| AI Agent relevant insight rate | 100% in demo |

---

## Risk & Fallback Summary

| Risk | Fallback |
|------|----------|
| OCR misreads text | User edits result before saving (Human-in-the-Loop) |
| LLM returns invalid JSON | Rule-based validation rejects it → prompt user for manual input |
| LLM API is slow | Show loading state, process async, never block the UI |
| Incomplete transaction data | Agent runs with partial context — still outputs partial insight |
