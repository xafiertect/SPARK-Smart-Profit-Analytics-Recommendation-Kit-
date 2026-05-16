---
trigger: always_on
---

# SPARK — Database Rules
**PostgreSQL · SQLAlchemy · Alembic · Row-Level Security**

---

## Core Principles

- **Relational integrity first** — use foreign keys everywhere
- **One user's data is invisible to another** — enforce at DB level, not just app level
- **Never delete financial data** — use soft deletes (is_deleted flag)
- **All migrations tracked** — no manual SQL changes to production schema

---

## Database Schema

### Users
```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    hashed_pw   TEXT NOT NULL,
    business_name TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    is_active   BOOLEAN DEFAULT true
);
```

### Products (Baseline catalog per user)
```sql
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    unit        VARCHAR(50),              -- e.g. "kg", "pcs", "box"
    base_price  NUMERIC(15, 2) NOT NULL,  -- purchase price
    sell_price  NUMERIC(15, 2) NOT NULL,  -- selling price
    current_stock NUMERIC(15, 3) DEFAULT 0,
    min_stock_threshold NUMERIC(15, 3) DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),
    is_deleted  BOOLEAN DEFAULT false     -- soft delete
);
```

### Transactions
```sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'purchase')),
    total_amount    NUMERIC(15, 2) NOT NULL,
    source          VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'ocr')),
    ocr_raw_text    TEXT,                -- original OCR output, kept for audit
    transaction_date DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    is_deleted      BOOLEAN DEFAULT false
);
```

### Transaction Line Items
```sql
CREATE TABLE transaction_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id),  -- nullable if product not in catalog
    product_name    VARCHAR(255) NOT NULL,          -- always store the name as text too
    quantity        NUMERIC(15, 3) NOT NULL,
    unit_price      NUMERIC(15, 2) NOT NULL,
    subtotal        NUMERIC(15, 2) NOT NULL
);
```

### AI Insights (Stored for dashboard display)
```sql
CREATE TABLE ai_insights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trigger_type    VARCHAR(100) NOT NULL,   -- e.g. "LOW_STOCK", "EXPENSE_SPIKE"
    trigger_data    JSONB,                   -- the raw rule data that fired
    insight_text    TEXT NOT NULL,           -- LLM-generated explanation
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## SQLAlchemy ORM Patterns

Use **async SQLAlchemy** with `AsyncSession`:

```python
# core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

```python
# models/transaction.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
import uuid

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    total_amount: Mapped[float]
    transaction_type: Mapped[str]
    transaction_date: Mapped[date]
    is_deleted: Mapped[bool] = mapped_column(default=False)

    items: Mapped[list["TransactionItem"]] = relationship(back_populates="transaction")
```

---

## Alembic Migration Rules

**Never modify the database schema manually.** All changes go through Alembic:

```bash
# Create a new migration
alembic revision --autogenerate -m "add min_stock_threshold to products"

# Apply migrations
alembic upgrade head

# Check current state
alembic current
```

Migration naming format: `YYYY_MM_DD_short_description`
Example: `2024_01_15_add_ai_insights_table`

---

## Row-Level Security (RLS)

Enable RLS on all tables that contain user data. This ensures the database itself enforces data isolation — not just the application layer.

```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own rows
CREATE POLICY tenant_isolation ON transactions
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Apply same pattern to: products, transaction_items, ai_insights
```

Set the user context at the start of each database session in the FastAPI middleware:

```python
async def set_rls_context(db: AsyncSession, user_id: UUID):
    await db.execute(
        text("SELECT set_config('app.current_user_id', :uid, true)"),
        {"uid": str(user_id)}
    )
```

---

## Soft Delete Rules

Never hard-delete financial records. Use `is_deleted = true` instead.

```python
# ✅ Correct — soft delete
async def delete_product(product_id: UUID, db: AsyncSession):
    product = await db.get(Product, product_id)
    product.is_deleted = True
    await db.commit()

# ❌ Wrong — permanent data loss
async def delete_product(product_id: UUID, db: AsyncSession):
    await db.delete(product)
    await db.commit()
```

All queries must filter out soft-deleted rows:
```python
stmt = select(Product).where(Product.user_id == user_id, Product.is_deleted == False)
```

---

## Indexing Strategy

Add indexes for columns that appear in WHERE clauses frequently:

```sql
-- Queries filter by user_id on every table
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_ai_insights_user_unread ON ai_insights(user_id) WHERE is_read = false;
```

---

## Backup Policy (Production)

- Automated daily backups — retain for 30 days
- Point-in-time recovery enabled
- Test restore procedure monthly
- Backup files encrypted at rest
