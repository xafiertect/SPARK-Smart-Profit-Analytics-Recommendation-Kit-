---
trigger: always_on
---

# SPARK — Backend Rules
**FastAPI · PostgreSQL · Async · Modular**

---

## Core Principles

The backend is the engine room. It must be:
- **Fast** — no blocking operations on the main thread
- **Safe** — validate everything in, validate everything out
- **Modular** — one file per domain, not one giant file
- **Predictable** — same input always produces the same output for financial calculations

---

## FastAPI Structure

```
backend/
├── main.py                    # App entry point, include routers
├── core/
│   ├── config.py              # Settings (env vars via pydantic-settings)
│   ├── database.py            # SQLAlchemy async engine + session
│   └── security.py            # JWT creation & verification
├── routers/
│   ├── auth.py                # /api/v1/auth
│   ├── products.py            # /api/v1/products
│   ├── transactions.py        # /api/v1/transactions
│   ├── ocr.py                 # /api/v1/ocr
│   └── agent.py               # /api/v1/agent
├── models/
│   └── *.py                   # SQLAlchemy ORM models
├── schemas/
│   └── *.py                   # Pydantic schemas (request + response)
└── services/
    ├── ocr_service.py         # PaddleOCR logic
    ├── llm_service.py         # LLM API calls (correction + parsing)
    ├── financial_engine.py    # Rule-based financial calculations
    ├── context_builder.py     # get_business_context()
    └── ai_agent.py            # Rule triggers + LLM reasoning
```

---

## Async Rules

**Every endpoint that touches an external service must be async:**

```python
# ✅ Correct
@router.post("/ocr/scan")
async def scan_receipt(file: UploadFile, db: AsyncSession = Depends(get_db)):
    result = await ocr_service.extract(file)
    return result

# ❌ Wrong — this blocks the server
@router.post("/ocr/scan")
def scan_receipt(file: UploadFile):
    result = ocr_service.extract(file)  # blocks everything!
    return result
```

External services that **must** be async:
- LLM API calls (Claude / OpenAI)
- PaddleOCR processing
- Any file I/O

---

## Pydantic Schema Rules

Every API endpoint must have an explicit input schema and output schema.

```python
# schemas/transactions.py

class TransactionItemIn(BaseModel):
    product_name: str
    quantity: float
    unit_price: float

class TransactionCreateIn(BaseModel):
    items: list[TransactionItemIn]
    transaction_date: date
    notes: str | None = None

class TransactionOut(BaseModel):
    id: UUID
    total_amount: float
    profit: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

**Rules:**
- Never return raw SQLAlchemy model objects from endpoints
- Always define a separate `*In` (input) and `*Out` (output) schema
- Use `model_config = ConfigDict(from_attributes=True)` on all output schemas

---

## Background Tasks

For slow operations (OCR, insight generation), use FastAPI Background Tasks:

```python
from fastapi import BackgroundTasks

@router.post("/transactions/scan")
async def scan_and_save(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Return immediately with a job ID
    job_id = str(uuid4())
    background_tasks.add_task(process_receipt, job_id, file, db)
    return {"job_id": job_id, "status": "processing"}
```

If request volume grows large, migrate to **Celery + Redis** for the task queue.

---

## API Versioning

All routes are prefixed with `/api/v1/`. Example:

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/products
POST   /api/v1/products
POST   /api/v1/ocr/scan
POST   /api/v1/transactions
GET    /api/v1/transactions?date_from=&date_to=
GET    /api/v1/agent/insights
POST   /api/v1/agent/chat
```

---

## Authentication (JWT)

- Access token expires in **30 minutes**
- Refresh token expires in **7 days**
- Store refresh token in an **httpOnly cookie** (not localStorage)
- Every protected endpoint uses `Depends(get_current_user)`

```python
# core/security.py
def create_access_token(user_id: UUID) -> str: ...
def verify_token(token: str) -> UUID: ...

# Usage in any router
@router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ...
```

---

## Financial Engine Rules (Rule-Based — No AI Here)

The financial engine is **purely deterministic**. No LLM involved. No guessing.

```python
# services/financial_engine.py

def calculate_daily_summary(transactions: list[Transaction]) -> DailySummary:
    income    = sum(t.total_amount for t in transactions if t.type == "sale")
    expense   = sum(t.total_amount for t in transactions if t.type == "purchase")
    profit    = income - expense
    return DailySummary(income=income, expense=expense, profit=profit)
```

**Calculations the engine must handle:**
- Total income / expense (daily, weekly, monthly)
- Profit / loss per period
- Cash flow summary
- Stock level per product (decrement on sale, increment on purchase)
- Moving average of daily sales per product (for stock recommendations)

**Rule:** Financial numbers must never come from LLM output. LLM is only for explanation text.

---

## AI Agent Rules

The AI Agent combines two layers:

### Layer 1: Rule-Based Triggers (Deterministic)

```python
# services/ai_agent.py

STOCK_SAFETY_DAYS = 3  # Trigger if stock < 3 days of average sales

def check_low_stock(product: Product, avg_daily_sales: float) -> bool:
    return product.current_stock < (avg_daily_sales * STOCK_SAFETY_DAYS)

def check_expense_spike(this_week: float, last_week: float) -> bool:
    return this_week > last_week * 1.25  # 25% increase threshold
```

Trigger conditions to detect:
- Stock below 3-day average sales threshold
- Weekly expense increased by ≥ 25% vs previous week
- Specific product has zero sales for 7+ days (dead stock warning)
- Cash flow negative for 3+ consecutive days

### Layer 2: LLM Reasoning (Explanation Only)

When a trigger fires, pass the context to the LLM to generate a plain-language explanation.

```python
AGENT_PROMPT = """
You are a friendly financial assistant for a small business owner in Indonesia.
A rule-based system detected the following issue:

Issue: {trigger_type}
Data: {trigger_data}
Business Context: {business_context}

Write a SHORT, clear recommendation in Bahasa Indonesia (2-3 sentences max).
Explain: what the problem is, why it matters, and what action to take.
Do NOT use technical terms. Write like you're talking to a friend.
"""
```

**Rule:** The LLM generates *explanations*, not *decisions*. Decisions come from rules.

---

## get_business_context() — Context Builder

This function aggregates everything the AI Agent needs into one object:

```python
async def get_business_context(user_id: UUID, db: AsyncSession) -> BusinessContext:
    return BusinessContext(
        products=await get_all_products(user_id, db),
        stock_levels=await get_current_stock(user_id, db),
        daily_sales_avg=await get_daily_sales_average(user_id, db, days=7),
        this_week_expense=await get_period_expense(user_id, db, period="this_week"),
        last_week_expense=await get_period_expense(user_id, db, period="last_week"),
        cash_flow_last_7_days=await get_cash_flow_trend(user_id, db, days=7),
    )
```

This context object is passed to both the AI Agent and the AI Business Consultant.

---

## Error Handling

Use consistent error response format across all endpoints:

```python
# Always return this shape on error
{
  "error": true,
  "code": "OCR_PARSE_FAILED",
  "message": "We couldn't read that receipt. Try a clearer photo.",
  "detail": "..."   # only in development mode
}
```

Use FastAPI's `HTTPException` for standard errors. Create custom exception handlers for:
- LLM timeout → return fallback rule-based-only insight
- OCR failure → return empty extraction with a prompt to fill manually
- Database connection error → 503 with retry message
