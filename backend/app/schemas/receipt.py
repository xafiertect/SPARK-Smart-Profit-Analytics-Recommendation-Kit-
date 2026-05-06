from pydantic import BaseModel, Field
from typing import List

class ReceiptItem(BaseModel):
    nama: str = Field(..., description="Nama barang hasil ekstraksi/koreksi")
    qty: int = Field(..., description="Jumlah barang")
    harga: int = Field(..., description="Harga satuan barang")
    subtotal: int = Field(..., description="Subtotal (qty * harga)")

class ReceiptExtractionResult(BaseModel):
    items: List[ReceiptItem] = Field(default_factory=list, description="Daftar barang dalam nota")
    total_nota: int = Field(0, description="Total keseluruhan nota")
