import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    unit: Mapped[str | None] = mapped_column(String(50))
    base_price: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    sell_price: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    current_stock: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    min_stock_threshold: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
