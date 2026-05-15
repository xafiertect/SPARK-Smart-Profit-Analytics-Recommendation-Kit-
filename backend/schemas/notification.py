from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: UUID
    type: str
    priority: str
    status: str
    title: str
    message: str
    action_data: dict | None
    related_product_id: UUID | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class NotificationStatusUpdate(BaseModel):
    status: str  # READ, DONE, IGNORED


class UnreadCountOut(BaseModel):
    count: int
