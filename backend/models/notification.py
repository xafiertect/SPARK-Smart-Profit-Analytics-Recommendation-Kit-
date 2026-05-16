import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Type: LOW_STOCK, STOCK_EMPTY, UNCONFIGURED_PRODUCT, NEW_PRODUCT, INFO
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Priority: CRITICAL, WARNING, ACTION_REQUIRED, NEW_PRODUCT, INFO
    priority: Mapped[str] = mapped_column(String(30), nullable=False, default="INFO")
    # Status: NEW, READ, DONE, IGNORED
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="NEW")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    # JSON data for navigation/action context
    action_data: Mapped[dict | None] = mapped_column(JSON)
    related_product_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("products.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
