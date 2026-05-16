from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ExpenseCreateIn(BaseModel):
    name: str
    expense_date: date
    category: str = "Lainnya"
    related_product_id: UUID | None = None
    related_product_name: str | None = None
    stock_quantity: float | None = None
    unit_price_snapshot: float | None = None
    total_default: float | None = None
    total_actual: float
    notes: str | None = None
    source: str = "manual"


class ExpenseUpdateIn(BaseModel):
    name: str | None = None
    expense_date: date | None = None
    category: str | None = None
    total_actual: float | None = None
    notes: str | None = None


class ExpenseOut(BaseModel):
    id: UUID
    name: str
    expense_date: date
    category: str
    related_product_id: UUID | None
    related_product_name: str | None
    stock_quantity: float | None
    unit_price_snapshot: float | None
    total_default: float | None
    total_actual: float
    notes: str | None
    source: str
    status: str
    is_deleted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
