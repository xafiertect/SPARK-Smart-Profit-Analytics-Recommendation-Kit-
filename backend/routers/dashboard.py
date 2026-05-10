from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.transaction import DailySummaryOut
from services.financial_engine import calculate_daily_summary, calculate_weekly_summary

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    daily = await calculate_daily_summary(current_user.id, today, db)
    weekly = await calculate_weekly_summary(current_user.id, today, db)

    return {
        "today": daily,
        "week": weekly,
    }
