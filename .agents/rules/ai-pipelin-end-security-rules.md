---
trigger: always_on
---

# SPARK — AI Pipeline & Security Rules
**OCR · LLM · AI Agent · Network Isolation**

---

## AI Pipeline Overview

```
User uploads receipt photo
        ↓
  PaddleOCR extracts raw text
        ↓
  LLM cleans + structures into JSON
        ↓
  Pydantic validates the JSON schema
        ↓
  User reviews & edits on validation screen
        ↓
  User confirms → data saved to PostgreSQL
        ↓
  Financial Engine recalculates totals
        ↓
  Context Builder runs get_business_context()
        ↓
  AI Agent checks rule triggers
        ↓
  If triggered → LLM generates explanation
        ↓
  Insight stored + shown on dashboard
```

---

## OCR Rules (PaddleOCR)

### Setup
```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    use_angle_cls=True,   # Handle rotated receipts
    lang="id",            # Indonesian + English
    use_gpu=False         # CPU for small deployment
)
```

### What to Extract
From every receipt image, extract:
- Line items: product name, quantity, unit price, subtotal
- Total amount
- Date (if visible)
- Transaction type context (sale or purchase)

### What to Do With Raw OCR Output
Never trust raw OCR output directly. Always pipe it through LLM correction first.

### Image Quality Tips (include these in the UI)
Tell users:
- "Use good lighting"
- "Keep the receipt flat"
- "Fit the whole receipt in the frame"

---

## LLM Integration Rules

### Prompt Design for Receipt Parsing

```python
RECEIPT_PARSE_PROMPT = """
You are a data extraction assistant. Extract transaction data from this OCR text.

OCR Text:
{ocr_text}

Known products catalog (for name matching):
{product_catalog}

Return ONLY a valid JSON object. No explanation. No markdown. Just the JSON.

Format:
{{
  "transaction_date": "YYYY-MM-DD or null",
  "items": [
    {{
      "product_name": "string",
      "quantity": number,
      "unit_price": number,
      "subtotal": number
    }}
  ],
  "total_amount": number,
  "confidence": "high|medium|low"
}}

Rules:
- Match product names to the catalog when possible
- If you can't read a value clearly, use null
- Do not invent numbers — if unsure, use null
- Date format must be YYYY-MM-DD
"""
```

### Validating LLM Output

Always validate LLM JSON output with Pydantic before using it:

```python
class ParsedReceiptItem(BaseModel):
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float | None = None

class ParsedReceipt(BaseModel):
    transaction_date: date | None
    items: list[ParsedReceiptItem]
    total_amount: float | None
    confidence: Literal["high", "medium", "low"]

def parse_llm_output(raw: str) -> ParsedReceipt:
    try:
        data = json.loads(raw)
        return ParsedReceipt(**data)
    except (json.JSONDecodeError, ValidationError):
        raise LLMParseError("LLM returned invalid format — fallback to manual input")
```

### LLM Timeout Handling

```python
async def call_llm_with_timeout(prompt: str, timeout_seconds: int = 15) -> str:
    try:
        async with asyncio.timeout(timeout_seconds):
            return await llm_client.complete(prompt)
    except TimeoutError:
        raise LLMTimeoutError("LLM took too long — showing rule-based result only")
```

### AI Business Consultant Prompt

```python
CONSULTANT_SYSTEM_PROMPT = """
You are SPARK, a friendly financial assistant for small business owners in Indonesia.
You help them understand their business data and make smart decisions.

Rules:
- Always use simple language. No jargon.
- Always base your answer on the provided business context data.
- Never make up numbers. If you don't have the data, say so.
- Be concise. Max 3-4 sentences per answer.
- Write in Bahasa Indonesia unless the user writes in English.

Business Context:
{business_context}
"""
```

---

## AI Agent — Trigger Reference

All triggers are defined as constants. Change thresholds here, not scattered across code.

```python
# services/ai_agent.py

class AgentThresholds:
    LOW_STOCK_DAYS = 3           # Alert if stock < 3 days of avg sales
    EXPENSE_SPIKE_PERCENT = 25   # Alert if this week > last week by 25%
    DEAD_STOCK_DAYS = 7          # Alert if no sales in 7 days
    NEGATIVE_CASHFLOW_DAYS = 3   # Alert if cash flow negative for 3 days in a row

class TriggerType:
    LOW_STOCK = "LOW_STOCK"
    EXPENSE_SPIKE = "EXPENSE_SPIKE"
    DEAD_STOCK = "DEAD_STOCK"
    NEGATIVE_CASHFLOW = "NEGATIVE_CASHFLOW"
```

### Agent Execution Flow

```python
async def run_agent(user_id: UUID, db: AsyncSession) -> list[AgentInsight]:
    context = await get_business_context(user_id, db)
    triggered = []

    # Check all rule triggers
    for product in context.products:
        avg_sales = context.daily_sales_avg.get(product.id, 0)
        if check_low_stock(product, avg_sales):
            triggered.append(Trigger(TriggerType.LOW_STOCK, product=product, avg=avg_sales))

    if check_expense_spike(context.this_week_expense, context.last_week_expense):
        triggered.append(Trigger(TriggerType.EXPENSE_SPIKE, ...))

    # Generate LLM explanation for each trigger
    insights = []
    for trigger in triggered:
        explanation = await generate_explanation(trigger, context)
        insights.append(AgentInsight(trigger=trigger, text=explanation))

    # Save insights to database
    await save_insights(user_id, insights, db)
    return insights
```

---

## Network Security — Infrastructure Rules

### Architecture Diagram

```
Internet
    ↓
[CDN / Vercel]          ← React frontend (public)
    ↓
[Nginx / Traefik]       ← Reverse proxy (API Gateway, public)
    ↓  (private network only beyond this point)
[FastAPI Backend]       ← Private subnet, no public port
    ↓
[PostgreSQL]            ← Private subnet, no public port
```

### Rules

- **Frontend** is the only thing exposed to the public internet
- **Backend** listens on private network only — never expose port 8000 publicly
- **Database** never has a public IP — accessible only from the backend server
- **API Gateway (Nginx)** is the single entry point — handles SSL termination and rate limiting

### Developer Access to Private Network

Use **Tailscale** (preferred) or SSH tunnel via Bastion Host:

```bash
# Tailscale: after auth, private IPs are directly accessible
tailscale up

# SSH tunnel to PostgreSQL (if no Tailscale)
ssh -L 5432:db-server:5432 user@bastion-host
```

### Nginx Rate Limiting

```nginx
# Protect the OCR and AI endpoints from abuse
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=ai:10m rate=10r/m;

location /api/v1/ocr/ {
    limit_req zone=api burst=5 nodelay;
    proxy_pass http://backend:8000;
}

location /api/v1/agent/ {
    limit_req zone=ai burst=3 nodelay;
    proxy_pass http://backend:8000;
}
```

### CORS Policy

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # No wildcard in production
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Security Checklist

Before deploying to production:

- [ ] No secrets in source code (use environment variables)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS enforced (no HTTP in production)
- [ ] JWT secrets are randomly generated (min 32 chars)
- [ ] Database password is strong and unique
- [ ] CORS `allow_origins` does not use `*`
- [ ] Rate limiting enabled on all AI endpoints
- [ ] Row-Level Security enabled on all user data tables
- [ ] No database port exposed to public internet
- [ ] LLM API key stored as environment variable, not hardcoded
