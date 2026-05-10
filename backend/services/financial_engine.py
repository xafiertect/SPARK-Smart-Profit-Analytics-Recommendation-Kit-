from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.transaction import Transaction
from models.product import Product


def _calculate_summary(transactions: list[Transaction]) -> dict:
    """Pure function to calculate summary from a list of transactions."""
    income = sum(float(t.total_amount) for t in transactions if t.transaction_type == "sale")
    expense = sum(float(t.total_amount) for t in transactions if t.transaction_type == "purchase")
    profit = income - expense
    return {
        "income": income,
        "expense": expense,
        "profit": profit,
    }


async def calculate_daily_summary(
    user_id: UUID, target_date: date, db: AsyncSession
) -> dict:
    """Pure rule-based daily financial summary. No AI involved."""
    stmt = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_date == target_date,
        Transaction.is_deleted == False,
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    summary = _calculate_summary(transactions)

    return {
        "date": target_date,
        "income": summary["income"],
        "expense": summary["expense"],
        "profit": summary["profit"],
        "transaction_count": len(transactions),
    }


async def calculate_weekly_summary(
    user_id: UUID, end_date: date, db: AsyncSession
) -> dict:
    """Aggregate 7-day summary."""
    start_date = end_date - timedelta(days=6)
    stmt = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date,
        Transaction.is_deleted == False,
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    summary = _calculate_summary(transactions)

    return {
        "start_date": start_date,
        "end_date": end_date,
        "income": summary["income"],
        "expense": summary["expense"],
        "profit": summary["profit"],
        "transaction_count": len(transactions),
    }


async def update_stock(
    user_id: UUID, product_name: str, quantity: float,
    transaction_type: str, db: AsyncSession
) -> None:
    """Adjust stock: decrement on sale, increment on purchase."""
    stmt = select(Product).where(
        Product.user_id == user_id,
        Product.name == product_name,
        Product.is_deleted == False,
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if product is None:
        return

    if transaction_type == "sale":
        product.current_stock = max(0, float(product.current_stock) - quantity)
    elif transaction_type == "purchase":
        product.current_stock = float(product.current_stock) + quantity


async def get_daily_sales_average(
    user_id: UUID, db: AsyncSession, days: int = 7
) -> dict[str, float]:
    """Moving average of daily sales per product over N days."""
    end = date.today()
    start = end - timedelta(days=days - 1)

    stmt = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "sale",
        Transaction.transaction_date >= start,
        Transaction.transaction_date <= end,
        Transaction.is_deleted == False,
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    product_totals: dict[str, float] = {}
    for txn in transactions:
        await db.refresh(txn, ["items"])
        for item in txn.items:
            product_totals[item.product_name] = product_totals.get(item.product_name, 0) + float(item.quantity)

    return {name: total / days for name, total in product_totals.items()}
