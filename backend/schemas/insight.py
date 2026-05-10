from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InsightOut(BaseModel):
    id: UUID
    trigger_type: str
    trigger_data: dict | None
    insight_text: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatIn(BaseModel):
    message: str


class ChatOut(BaseModel):
    reply: str
