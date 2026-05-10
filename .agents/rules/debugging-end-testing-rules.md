---
trigger: always_on
---

# SPARK — Debugging & Testing Rules
**Systematic Bug Hunting · Unit · Integration · E2E**

---

## Core Philosophy

- Never guess the root cause. Trace the data flow first.
- Fix the source, not the symptom.
- Every bug fixed must have a test that would have caught it.
- No `print()` debugging left in committed code — use the logger.

---

## Debugging Protocol

When something breaks, follow this order. Do not skip steps.

```
1. Read the full error message + stack trace
        ↓
2. Identify which layer owns the error
   (Frontend / Nginx / FastAPI / Service / DB)
        ↓
3. Isolate — reproduce with the smallest possible input
        ↓
4. Trace data flow from that layer upward
        ↓
5. Fix the root cause
        ↓
6. Write a test that catches this exact failure
        ↓
7. Verify fix does not break adjacent features
```

---

## Layer-by-Layer Debugging

### Frontend

```bash
# Check network tab first — what did the API actually return?
# Common issues:
# - 401 → token expired or not attached
# - 422 → request body shape mismatch
# - CORS error → Nginx config or backend allow_origins wrong
# - undefined is not iterable → API returned error envelope, not data array
```

```javascript
// Wrap all API calls — never let errors surface as blank screens
const fetchTransactions = async () => {
  try {
    const res = await api.get("/transactions");
    return res.data.data; // always unwrap envelope
  } catch (err) {
    const code = err.response?.data?.code ?? "UNKNOWN_ERROR";
    const msg  = err.response?.data?.message ?? "Something went wrong.";
    setError({ code, msg });
  }
};
```

Checklist:
- [ ] Open DevTools → Network tab → check actual request/response
- [ ] Check Console for unhandled promise rejections
- [ ] Check Zustand store state — is the data shape what the component expects?
- [ ] Disable Service Worker cache if stale data suspected: DevTools → Application → Clear storage

---

### Backend (FastAPI)

```python
# logging setup — use this, not print()
import logging
logger = logging.getLogger(__name__)

# Usage
logger.debug("OCR raw output: %s", raw_text)
logger.warning("LLM confidence low: %s", confidence)
logger.error("DB write failed: %s", exc, exc_info=True)
```

```bash
# Run with live reload + visible logs
uvicorn main:app --reload --log-level debug

# Check which endpoint is actually being hit
# FastAPI auto-docs always available at:
http://localhost:8000/docs
http://localhost:8000/redoc

# Test endpoint directly without frontend
curl -X POST http://localhost:8000/api/v1/ocr/scan \
  -H "Authorization: Bearer <token>" \
  -F "file=@tests/fixtures/sample_receipt.jpg" | jq
```

Common FastAPI bugs:
| Symptom | Likely Cause |
|---------|-------------|
| 422 Unprocessable Entity | Request body doesn't match Pydantic schema |
| 500 on startup | Missing env var or DB connection failed |
| Endpoint returns `null` | Forgot `await` on async DB call |
| Slow response | Blocking sync call inside async def |
| CORS error | `allow_origins` missing frontend URL |

---

### Database

```bash
# Connect to DB (via Tailscale or local Docker)
psql $DATABASE_URL

# Check RLS is not blocking legitimate queries
SET app.current_user_id = '<your-user-uuid>';
SELECT * FROM transactions LIMIT 5;

# Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('transactions', 'products', 'ai_insights');

# Check Alembic migration state
alembic current
alembic history --verbose
```

Common DB bugs:
| Symptom | Likely Cause |
|---------|-------------|
| Query returns empty | RLS blocking — `app.current_user_id` not set |
| Duplicate key error | UUID collision or unique constraint violated |
| Slow queries | Missing index on `user_id` or `transaction_date` |
| Migration fails | Model changed but `alembic revision` not run |

---

### AI Pipeline

```python
# Debug OCR output before sending to LLM
async def scan_receipt_debug(file: UploadFile):
    raw_text = await ocr_service.extract(file)
    logger.debug("OCR raw:\n%s", raw_text)   # check this first

    parsed = await llm_service.parse(raw_text)
    logger.debug("LLM parsed:\n%s", parsed.model_dump_json(indent=2))

    return parsed
```

```bash
# Test LLM response schema manually
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "Test receipt: Gula 2kg x 15000"}]
  }' | jq '.content[0].text'
```

Common AI bugs:
| Symptom | Likely Cause |
|---------|-------------|
| `LLMParseError` | LLM returned markdown/prose instead of raw JSON |
| Items array empty | OCR extracted noise, LLM found nothing to parse |
| Wrong product names | Product catalog not passed in prompt context |
| Agent never triggers | Threshold constants too high — check `AgentThresholds` |
| Insight text in English | Language instruction missing in agent prompt |

---

## Testing Standards

### Structure

```
tests/
├── unit/
│   ├── test_financial_engine.py   # pure function tests, no DB
│   ├── test_ai_agent_triggers.py  # rule trigger logic only
│   └── test_llm_parser.py         # Pydantic schema validation
├── integration/
│   ├── test_ocr_pipeline.py       # OCR → LLM → ParsedReceipt
│   ├── test_transaction_flow.py   # API → DB → response
│   └── test_agent_full.py         # context builder → agent → insight stored
├── e2e/
│   └── test_demo_flow.py          # full user journey, real DB
└── fixtures/
    ├── sample_receipt.jpg          # printed receipt
    ├── sample_receipt_hw.jpg       # handwritten receipt
    └── mock_business_context.py    # reusable context factory
```

---

### Unit Tests

Fast. No DB. No LLM. No network. Pure logic only.

```python
# tests/unit/test_financial_engine.py

from services.financial_engine import calculate_daily_summary
from tests.fixtures.mock_business_context import make_transactions

def test_profit_calculation():
    transactions = make_transactions(sales=500_000, purchases=300_000)
    result = calculate_daily_summary(transactions)
    assert result.income  == 500_000
    assert result.expense == 300_000
    assert result.profit  == 200_000

def test_zero_sales_no_division_error():
    result = calculate_daily_summary([])
    assert result.profit == 0
```

```python
# tests/unit/test_ai_agent_triggers.py

from services.ai_agent import check_low_stock, check_expense_spike
from models.product import Product

def test_low_stock_triggers_below_threshold():
    p = Product(current_stock=5, name="Gula")
    assert check_low_stock(p, avg_daily_sales=3.0) is True   # 5 < 3*3=9

def test_low_stock_does_not_trigger_above_threshold():
    p = Product(current_stock=15, name="Gula")
    assert check_low_stock(p, avg_daily_sales=3.0) is False  # 15 >= 9

def test_expense_spike_at_exact_threshold():
    assert check_expense_spike(this_week=125_000, last_week=100_000) is True

def test_expense_spike_below_threshold():
    assert check_expense_spike(this_week=124_000, last_week=100_000) is False
```

---

### Integration Tests

Uses real DB (test database). Mocks external APIs (LLM, OCR).

```python
# tests/integration/test_transaction_flow.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_transaction_updates_stock(client: AsyncClient, auth_headers):
    # Create product first
    product = await client.post("/api/v1/products", headers=auth_headers,
        json={"name": "Gula", "current_stock": 50, "sell_price": 15000, "base_price": 12000})
    product_id = product.json()["data"]["id"]

    # Record a sale of 10 units
    await client.post("/api/v1/transactions", headers=auth_headers, json={
        "transaction_type": "sale",
        "items": [{"product_id": product_id, "quantity": 10, "unit_price": 15000}],
        "transaction_date": "2024-01-15"
    })

    # Stock must decrease
    updated = await client.get(f"/api/v1/products/{product_id}", headers=auth_headers)
    assert updated.json()["data"]["current_stock"] == 40

@pytest.mark.asyncio
async def test_user_cannot_access_other_user_data(client: AsyncClient):
    headers_a = await get_auth_headers(client, "user_a@spark.id")
    headers_b = await get_auth_headers(client, "user_b@spark.id")

    # User A creates a transaction
    tx = await client.post("/api/v1/transactions", headers=headers_a, json={...})
    tx_id = tx.json()["data"]["id"]

    # User B must get 404, not the transaction
    res = await client.get(f"/api/v1/transactions/{tx_id}", headers=headers_b)
    assert res.status_code == 404
```

---

### E2E Tests (Pre-Demo)

Simulates a real user session from login to AI insight.

```python
# tests/e2e/test_demo_flow.py

@pytest.mark.asyncio
async def test_full_spark_demo_flow(client: AsyncClient):
    # 1. Register
    await client.post("/api/v1/auth/register",
        json={"email": "demo@spark.id", "password": "Demo1234!"})

    headers = await get_auth_headers(client, "demo@spark.id")

    # 2. Baseline setup
    await client.post("/api/v1/products", headers=headers,
        json={"name": "Gula", "current_stock": 5, "sell_price": 15000, "base_price": 12000})

    # 3. Scan receipt (mocked OCR + LLM)
    with open("tests/fixtures/sample_receipt.jpg", "rb") as f:
        ocr_res = await client.post("/api/v1/ocr/scan", headers=headers,
            files={"file": f})
    assert ocr_res.status_code == 200
    assert len(ocr_res.json()["data"]["items"]) > 0

    # 4. Confirm transaction (human-in-the-loop)
    await client.post("/api/v1/transactions", headers=headers,
        json=ocr_res.json()["data"])

    # 5. AI Agent must detect low stock (current_stock=5, avg_sales=3 → triggers)
    insights = await client.get("/api/v1/agent/insights", headers=headers)
    assert insights.status_code == 200
    assert any(i["trigger_type"] == "LOW_STOCK" for i in insights.json()["data"])

    # 6. Dashboard loads under 5 seconds (measured at API level)
    import time
    start = time.time()
    await client.get("/api/v1/dashboard/summary", headers=headers)
    assert time.time() - start < 5.0
```

---

## Running Tests

```bash
# Unit only (fast — run on every save)
pytest tests/unit/ -v

# Integration (requires test DB running)
docker compose -f docker-compose.test.yml up -d
pytest tests/integration/ -v

# Full suite including E2E
pytest tests/ -v --tb=short

# Coverage report
pytest tests/ --cov=. --cov-report=term-missing

# Run only failed tests from last run
pytest tests/ --lf
```

---

## Coverage Targets

| Layer | Minimum Coverage |
|-------|-----------------|
| Financial Engine | 100% — zero tolerance for calculation bugs |
| AI Agent triggers | 100% — every threshold boundary tested |
| FastAPI routers | ≥ 80% |
| OCR / LLM services | ≥ 70% (mocked external calls) |
| Frontend components | ≥ 60% (critical paths only) |

---

## What Never Goes to Production

- [ ] `print()` statements anywhere in Python code
- [ ] `console.log()` with sensitive data in React
- [ ] Skipped tests (`pytest.mark.skip`) without an issue reference
- [ ] Test files importing from `__main__`
- [ ] Hardcoded user IDs or API keys in any test fixture
