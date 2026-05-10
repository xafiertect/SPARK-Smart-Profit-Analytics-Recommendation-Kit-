from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TransactionItemIn(BaseModel):
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float | None = None


class TransactionCreateIn(BaseModel):
    transaction_type: str  # 'sale' | 'purchase'
    items: list[TransactionItemIn]
    transaction_date: date
    notes: str | None = None
    source: str = "manual"


class TransactionItemOut(BaseModel):
    id: UUID
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class TransactionOut(BaseModel):
    id: UUID
    transaction_type: str
    total_amount: float
    source: str
    transaction_date: date
    notes: str | None
    is_deleted: bool
    created_at: datetime
    items: list[TransactionItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class DailySummaryOut(BaseModel):
    date: date
    income: float
    expense: float
    profit: float
    transaction_count: int
