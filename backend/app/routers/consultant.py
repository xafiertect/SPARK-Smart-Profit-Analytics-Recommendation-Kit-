from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.crud.insight import get_business_context
from app.services.consultant_service import get_consultant_response

router = APIRouter(
    prefix="/consultant",
    tags=["consultant"],
)

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_consultant(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Ambil konteks bisnis user
    context = await get_business_context(db, current_user.id)
    
    # 2. Kirim ke AI Consultant
    response = await get_consultant_response(request.message, context)
    
    return {"reply": response}
