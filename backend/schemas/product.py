from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductCreateIn(BaseModel):
    name: str
    category: str | None = None
    unit: str | None = "pcs"
    base_price: float
    sell_price: float
    current_stock: float = 0
    min_stock_threshold: float = 0


class ProductUpdateIn(BaseModel):
    name: str | None = None
    category: str | None = None
    unit: str | None = None
    base_price: float | None = None
    sell_price: float | None = None
    current_stock: float | None = None
    min_stock_threshold: float | None = None


class ProductOut(BaseModel):
    id: UUID
    name: str
    category: str | None
    unit: str | None
    base_price: float
    sell_price: float
    current_stock: float
    min_stock_threshold: float
    is_deleted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
