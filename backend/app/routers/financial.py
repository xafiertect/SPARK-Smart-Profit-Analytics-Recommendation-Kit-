from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.services.financial_service import get_financial_summary

router = APIRouter(
    prefix="/financial",
    tags=["financial"],
)

@router.get("/summary")
async def read_financial_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_financial_summary(db, current_user.id)
