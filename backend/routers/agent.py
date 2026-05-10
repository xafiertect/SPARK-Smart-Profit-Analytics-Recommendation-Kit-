from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.insight import AIInsight
from schemas.insight import InsightOut, ChatIn, ChatOut
from services.ai_agent import run_agent
from services.context_builder import get_business_context
from services.llm_service import chat_with_context

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


@router.get("/insights", response_model=list[InsightOut])
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIInsight)
        .where(AIInsight.user_id == current_user.id)
        .order_by(AIInsight.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.post("/insights/generate")
async def generate_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run AI agent: check rule triggers and generate new insights."""
    insights = await run_agent(current_user.id, db)
    return {"generated": len(insights), "insights": insights}


@router.post("/chat", response_model=ChatOut)
async def chat(
    data: ChatIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    context = await get_business_context(current_user.id, db)
    reply = await chat_with_context(data.message, context.__dict__)
    return ChatOut(reply=reply)
