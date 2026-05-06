from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class TransactionItemCreate(BaseModel):
    nama: str = Field(..., description="Nama barang hasil validasi")
    qty: int = Field(..., description="Jumlah barang")
    harga: Decimal = Field(..., description="Harga satuan barang")
    subtotal: Decimal = Field(..., description="Subtotal (qty * harga)")

class TransactionCreate(BaseModel):
    items: List[TransactionItemCreate] = Field(..., description="Daftar barang dalam transaksi")
    total_nota: Decimal = Field(..., description="Total keseluruhan transaksi")

class TransactionItemResponse(BaseModel):
    id: UUID
    product_name: str
    qty: int
    price: Decimal
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)

class TransactionResponse(BaseModel):
    id: UUID
    total_amount: Decimal
    created_at: datetime
    items: List[TransactionItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
