---
trigger: always_on
---

# SPARK PROJECT CONTEXT — LOAD ONCE

## Stack
React · FastAPI · PostgreSQL · PaddleOCR · LLM API

## Rules Index (already loaded in CLAUDE.md)
- project-rules-end-development-standards.md → project overview, git, KPIs
- frontend-rules.md → frontend (Antigravity UI, mobile-first)
- backend-rules.md → backend (FastAPI, async, financial engine)
- database-rules.md → database (schema, RLS, Alembic)
- ai-pipelin-end-security-rules.md → AI pipeline, security, network isolation
- integration-end-sync-rules.md → integration contracts, sync verification, pre-demo checklist
- debugging-end-testing-rules.md → debug protocol, unit/integration/e2e tests

## Session Instruction
All rules in CLAUDE.md are active. Do not re-explain them.
Apply silently on every response.

## How to Work
- I will give tasks per feature/domain.
- You execute based on the relevant rules file.
- If I say "frontend task" → apply frontend-rules.md standards.
- If I say "backend task" → apply backend-rules.md standards.
- If I say "db task" → apply database-rules.md standards.
- If I say "AI task" → apply ai-pipelin-end-security-rules.md standards.
- If I say "integration task" → apply integration-end-sync-rules.md standards.
- If I say "test task" → apply debugging-end-testing-rules.md standards.


## Efficiency Contract
- No confirmation messages ("Understood, I will now...").
- No restating what I asked.
- No summarizing what you just did at the end.
- Output: code + critical comments only.
- 1 clarifying question max if truly blocked.