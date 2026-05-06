from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    name: str = Field(..., description="Nama produk")
    category: Optional[str] = Field(None, description="Kategori produk")
    cost_price: Decimal = Field(..., ge=0, description="Harga beli produk")
    selling_price: Decimal = Field(..., ge=0, description="Harga jual produk")
    stock_quantity: int = Field(..., ge=0, description="Stok produk saat ini")
    unit: str = Field(..., description="Satuan produk (misal: pcs, porsi)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Nama produk")
    category: Optional[str] = Field(None, description="Kategori produk")
    cost_price: Optional[Decimal] = Field(None, ge=0, description="Harga beli produk")
    selling_price: Optional[Decimal] = Field(None, ge=0, description="Harga jual produk")
    stock_quantity: Optional[int] = Field(None, ge=0, description="Stok produk saat ini")
    unit: Optional[str] = Field(None, description="Satuan produk")

class ProductResponse(ProductBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
