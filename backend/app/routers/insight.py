from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.insight import InsightResponse
from app.crud.insight import get_business_context
from app.services import insight_service
from app.auth import get_current_user
from app.models import User

router = APIRouter(
    prefix="/insights",
    tags=["insights"],
)

@router.get("/", response_model=InsightResponse)
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Kumpulkan konteks data bisnis user spesifik
        context = await get_business_context(db, owner_id=current_user.id)
        
        # 2. Generate Insight
        insights_data = await insight_service.generate_business_insights(context)
        
        return insights_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
