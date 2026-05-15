import uuid
from datetime import date, datetime, timezone

from sqlalchemy import String, Numeric, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    # Category: "Pembelian Stok", "Operasional", "Lainnya", or custom
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Lainnya")
    # Link to product if expense is stock-related
    related_product_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("products.id"), nullable=True
    )
    related_product_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Stock purchase info (filled when source = auto-tambah-stok)
    stock_quantity: Mapped[float | None] = mapped_column(Numeric(15, 3), nullable=True)
    unit_price_snapshot: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    total_default: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    # The actual amount — always editable by user (RULE E-2)
    total_actual: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Source: "auto-tambah-stok" or "manual"
    source: Mapped[str] = mapped_column(String(30), nullable=False, default="manual")
    # Status: "draft" or "confirmed"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
