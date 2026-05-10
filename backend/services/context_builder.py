from dataclasses import dataclass, field
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.product import Product
from models.transaction import Transaction
from services.financial_engine import get_daily_sales_average, calculate_weekly_summary


@dataclass
class BusinessContext:
    products: list = field(default_factory=list)
    stock_levels: dict = field(default_factory=dict)
    daily_sales_avg: dict = field(default_factory=dict)
    this_week_expense: float = 0
    last_week_expense: float = 0


async def get_business_context(user_id: UUID, db: AsyncSession) -> BusinessContext:
    """Aggregate all data the AI agent needs into one object."""
    # Products
    stmt = select(Product).where(Product.user_id == user_id, Product.is_deleted == False)
    result = await db.execute(stmt)
    products = result.scalars().all()

    stock_levels = {p.name: float(p.current_stock) for p in products}
    daily_avg = await get_daily_sales_average(user_id, db, days=7)

    today = date.today()

    this_week = await calculate_weekly_summary(user_id, today, db)
    last_week = await calculate_weekly_summary(user_id, today - timedelta(days=7), db)

    return BusinessContext(
        products=[{"id": str(p.id), "name": p.name, "current_stock": float(p.current_stock),
                   "min_stock_threshold": float(p.min_stock_threshold), "sell_price": float(p.sell_price)}
                  for p in products],
        stock_levels=stock_levels,
        daily_sales_avg=daily_avg,
        this_week_expense=this_week["expense"],
        last_week_expense=last_week["expense"],
    )
