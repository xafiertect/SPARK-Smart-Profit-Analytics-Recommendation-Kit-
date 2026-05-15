from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict
from typing import Literal


class TransactionItemIn(BaseModel):
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float | None = None


class ParsedReceiptItem(BaseModel):
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float | None = None
    is_new_product: bool | None = False
    flag: str | None = None

class ParsedReceipt(BaseModel):
    transaction_date: date | str | None
    items: list[ParsedReceiptItem]
    total_amount: float | None
    confidence: Literal["high", "medium", "low"]
    raw_text: str | None = None



class TransactionCreateIn(BaseModel):
    transaction_type: str  # 'sale' | 'purchase'
    items: list[TransactionItemIn]
    transaction_date: date
    notes: str | None = None
    source: str = "manual"
    total_amount: float | None = None


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
