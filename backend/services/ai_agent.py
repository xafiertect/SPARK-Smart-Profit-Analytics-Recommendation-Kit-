"""
AI Agent: rule-based triggers + LLM-generated explanations.
Decisions come from rules. LLM only generates explanations.
"""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from models.insight import AIInsight
from services.context_builder import get_business_context, BusinessContext
from services.llm_service import generate_explanation


# --- Thresholds (change here, not scattered) ---
STOCK_SAFETY_DAYS = 3
EXPENSE_SPIKE_PERCENT = 25
DEAD_STOCK_DAYS = 7
NEGATIVE_CASHFLOW_DAYS = 3


def check_low_stock(product: dict, avg_daily_sales: float) -> bool:
    return product["current_stock"] < (avg_daily_sales * STOCK_SAFETY_DAYS)


def check_expense_spike(this_week: float, last_week: float) -> bool:
    if last_week == 0:
        return False
    return this_week > last_week * (1 + EXPENSE_SPIKE_PERCENT / 100)


async def run_agent(user_id: UUID, db: AsyncSession) -> list[dict]:
    """Check all rule triggers, generate LLM-powered insights."""
    context = await get_business_context(user_id, db)
    ctx_dict = {
        "products": context.products,
        "stock_levels": context.stock_levels,
        "daily_sales_avg": context.daily_sales_avg,
        "this_week_expense": context.this_week_expense,
        "last_week_expense": context.last_week_expense,
    }
    insights: list[dict] = []

    # Low stock checks
    for product in context.products:
        avg = context.daily_sales_avg.get(product["name"], 0)
        if check_low_stock(product, avg):
            trigger_data = {
                "product_name": product["name"],
                "current_stock": product["current_stock"],
                "avg_daily_sales": avg,
            }
            # LLM generates explanation (falls back to rule-based text)
            explanation = await generate_explanation(
                "LOW_STOCK", trigger_data, ctx_dict
            )
            insight = AIInsight(
                user_id=user_id,
                trigger_type="LOW_STOCK",
                trigger_data=trigger_data,
                insight_text=explanation,
            )
            db.add(insight)
            insights.append({
                "trigger_type": "LOW_STOCK",
                "trigger_data": trigger_data,
                "insight_text": explanation,
            })

    # Expense spike check
    if check_expense_spike(context.this_week_expense, context.last_week_expense):
        increase_pct = (
            (context.this_week_expense - context.last_week_expense)
            / context.last_week_expense * 100
        ) if context.last_week_expense > 0 else 0
        trigger_data = {
            "this_week": context.this_week_expense,
            "last_week": context.last_week_expense,
            "increase_pct": increase_pct,
        }
        explanation = await generate_explanation(
            "EXPENSE_SPIKE", trigger_data, ctx_dict
        )
        insight = AIInsight(
            user_id=user_id,
            trigger_type="EXPENSE_SPIKE",
            trigger_data=trigger_data,
            insight_text=explanation,
        )
        db.add(insight)
        insights.append({
            "trigger_type": "EXPENSE_SPIKE",
            "trigger_data": trigger_data,
            "insight_text": explanation,
        })

    await db.commit()
    return insights
