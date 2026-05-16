---
trigger: always_on
---

# SPARK — Integration & Sync Rules
**Frontend ↔ Backend ↔ AI Pipeline ↔ Security — Full Stack Verification**

---

## Purpose

This file defines how all SPARK layers connect to each other and how to verify they are
in sync. Run this checklist after every major feature merge or before demo day.

---

## Integration Map

```
React Frontend
    │
    │  HTTPS only · JWT in Authorization header · JSON body
    ▼
Nginx (API Gateway)
    │
    │  Rate limited · CORS enforced · SSL terminated
    ▼
FastAPI Backend
    │
    ├──► PaddleOCR Service      (internal call, no network)
    ├──► LLM API                (external HTTPS, timeout 15s)
    ├──► Financial Engine       (in-process, pure Python)
    ├──► AI Agent               (in-process, calls LLM API)
    └──► PostgreSQL             (private subnet, async SQLAlchemy)
```

---

## Contract Rules (Must Never Break)

These are the binding contracts between each layer.
If any layer changes its output shape, the connected layer must be updated in the same PR.

### 1. Frontend → Backend Contract

| Rule | Detail |
|------|--------|
| Auth header | `Authorization: Bearer <access_token>` on every protected request |
| Content type | Always `application/json` (except file upload: `multipart/form-data`) |
| Error handling | Frontend must handle: 401, 403, 422, 429, 500 — show user-friendly message |
| Loading state | Every API call must show a loading indicator — never fire and forget silently |
| File upload | Receipt image sent as `multipart/form-data`, field name: `file` |

### 2. Backend → Frontend Contract

All API responses follow this envelope:

```json
// Success
{
  "data": { ... },
  "meta": { "timestamp": "ISO8601" }
}

// Error
{
  "error": true,
  "code": "SNAKE_CASE_ERROR_CODE",
  "message": "Human-readable message in the user's language"
}
```

No endpoint is allowed to return raw data without this envelope.

### 3. OCR → LLM Contract

OCR output passed to LLM must always be a plain string.
LLM must always return valid JSON matching `ParsedReceipt` Pydantic schema.
If JSON is invalid → raise `LLMParseError`, do not pass corrupt data downstream.

### 4. LLM → Financial Engine Contract

Financial Engine only accepts data that has passed Pydantic validation.
Financial Engine never calls LLM — it is pure deterministic Python.
Numbers from LLM output are never used directly in financial calculations without
first being validated as `float` or `Decimal`.

### 5. AI Agent → Database Contract

Agent insights are stored only after:
1. Rule trigger confirmed (deterministic check passed)
2. LLM explanation generated successfully
3. Pydantic schema validated

Never store a partial or unvalidated insight.

### 6. Backend → Database Contract

Every query includes `user_id` filter — no cross-tenant data leakage.
RLS is active as a second enforcement layer.
All writes go through a transaction — no partial saves on multi-table operations.

---

## Sync Verification Checklist

Run this end-to-end after every major change.

### Layer 1 — Frontend ↔ Backend

```bash
# Start both services
docker compose up backend frontend

# Test auth flow
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@spark.id","password":"Test1234!"}'

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@spark.id","password":"Test1234!"}'
# → Should return access_token
```

Verify in browser (React):
- [ ] Register → redirects to baseline setup
- [ ] Login → JWT stored, dashboard loads
- [ ] Expired token → redirected to login, not blank screen
- [ ] 401 response → shows "Session expired, please login again"

### Layer 2 — Backend ↔ Database

```bash
# Check RLS is active
psql $DATABASE_URL -c "
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('transactions','products','ai_insights');
"
# All rows must show rowsecurity = true

# Check migrations are up to date
alembic current
alembic heads
# Both must show the same revision hash
```

- [ ] User A cannot read User B's transactions (test with two accounts)
- [ ] Soft-deleted records do not appear in any GET response
- [ ] Foreign key violations are caught and return 422, not 500

### Layer 3 — OCR ↔ LLM ↔ Validation Screen

```bash
# Test OCR pipeline with a sample receipt image
curl -X POST http://localhost:8000/api/v1/ocr/scan \
  -H "Authorization: Bearer <token>" \
  -F "file=@tests/fixtures/sample_receipt.jpg"
# → Should return ParsedReceipt JSON within 15 seconds
```

- [ ] Printed receipt → parsed correctly, confidence: "high"
- [ ] Blurry image → returns confidence: "low", UI shows warning
- [ ] Unreadable image → returns empty items array, UI prompts manual input
- [ ] LLM timeout (simulate with mock) → fallback message shown, no crash
- [ ] Validation screen shows all parsed fields as editable
- [ ] Edited fields are saved correctly, not the original OCR values

### Layer 4 — Financial Engine ↔ AI Agent

```python
# tests/test_integration_agent.py

async def test_low_stock_triggers_insight():
    # Setup: product with stock below threshold
    product = Product(current_stock=2, name="Gula")
    avg_daily_sales = 5.0  # 3-day threshold = 15 units

    trigger_fired = check_low_stock(product, avg_daily_sales)
    assert trigger_fired is True

    # LLM generates explanation
    insight = await generate_explanation(
        trigger=Trigger(TriggerType.LOW_STOCK, product=product),
        context=mock_business_context()
    )
    assert insight.text is not None
    assert len(insight.text) > 0

async def test_financial_engine_never_uses_llm_numbers():
    # Financial engine must only use validated Pydantic data
    raw_llm_output = '{"total_amount": "not_a_number"}'
    with pytest.raises(LLMParseError):
        parsed = parse_llm_output(raw_llm_output)
```

- [ ] Low stock trigger fires correctly at threshold boundary
- [ ] Expense spike trigger fires at ≥ 25% increase
- [ ] Financial totals match sum of transaction items (no rounding drift)
- [ ] Agent does not run if `get_business_context()` returns empty data

### Layer 5 — Security Verification

```bash
# CORS — reject unauthorized origin
curl -X GET http://localhost:8000/api/v1/products \
  -H "Origin: http://evil-site.com" \
  -H "Authorization: Bearer <token>"
# → Should return 403 or CORS error

# Rate limiting — hammer AI endpoint
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/v1/agent/insights \
    -H "Authorization: Bearer <token>"
done
# → Should return 429 after limit exceeded

# No public DB port
nc -zv <server-ip> 5432
# → Should be refused / timeout

# JWT tamper test
curl -X GET http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer fake.token.here"
# → Must return 401
```

- [ ] HTTPS enforced — HTTP requests redirect to HTTPS in production
- [ ] No secrets in `git log` or `env` output
- [ ] `.env` is in `.gitignore` and not tracked
- [ ] LLM API key not visible in any response or log output

---

## Pre-Demo Final Check (Day 7)

Run all of the above, then verify:

| Check | Target | Pass? |
|-------|--------|-------|
| Dashboard load time | < 5 seconds | ☐ |
| OCR scan to validation screen | < 15 seconds | ☐ |
| AI Agent insight generation | < 10 seconds | ☐ |
| Mobile layout at 375px | No overflow, no broken UI | ☐ |
| Two users — data isolation | Zero cross-tenant leakage | ☐ |
| LLM timeout fallback | Graceful message, no crash | ☐ |
| All API errors | Return correct envelope format | ☐ |

If any check fails → fix before demo. Do not proceed with a known broken integration.
