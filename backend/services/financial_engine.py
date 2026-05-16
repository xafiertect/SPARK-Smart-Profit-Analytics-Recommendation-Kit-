from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.transaction import Transaction
from models.product import Product
from models.expense import Expense


def _calculate_summary(transactions: list[Transaction], expenses: list[Expense]) -> dict:
    """Pure function to calculate summary from a list of transactions and expenses."""
    income = sum(float(t.total_amount) for t in transactions if t.transaction_type == "sale")
    expense_total = sum(float(e.total_actual) for e in expenses if e.status == "confirmed")
    profit = income - expense_total
    return {
        "income": income,
        "expense": expense_total,
        "profit": profit,
    }


async def calculate_daily_summary(
    user_id: UUID, target_date: date, db: AsyncSession
) -> dict:
    """Pure rule-based daily financial summary. No AI involved."""
    stmt_tx = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_date == target_date,
        Transaction.is_deleted == False,
        Transaction.transaction_type == "sale"
    )
    result_tx = await db.execute(stmt_tx)
    transactions = result_tx.scalars().all()

    stmt_exp = select(Expense).where(
        Expense.user_id == user_id,
        Expense.expense_date == target_date,
        Expense.is_deleted == False,
        Expense.status == "confirmed"
    )
    result_exp = await db.execute(stmt_exp)
    expenses = result_exp.scalars().all()

    summary = _calculate_summary(transactions, expenses)

    return {
        "date": target_date,
        "income": summary["income"],
        "expense": summary["expense"],
        "profit": summary["profit"],
        "transaction_count": len(transactions) + len(expenses),
    }


async def calculate_weekly_summary(
    user_id: UUID, end_date: date, db: AsyncSession
) -> dict:
    """Aggregate 7-day summary."""
    start_date = end_date - timedelta(days=6)
    stmt_tx = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= end_date,
        Transaction.is_deleted == False,
        Transaction.transaction_type == "sale"
    )
    result_tx = await db.execute(stmt_tx)
    transactions = result_tx.scalars().all()

    stmt_exp = select(Expense).where(
        Expense.user_id == user_id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date,
        Expense.is_deleted == False,
        Expense.status == "confirmed"
    )
    result_exp = await db.execute(stmt_exp)
    expenses = result_exp.scalars().all()

    summary = _calculate_summary(transactions, expenses)

    return {
        "start_date": start_date,
        "end_date": end_date,
        "income": summary["income"],
        "expense": summary["expense"],
        "profit": summary["profit"],
        "transaction_count": len(transactions) + len(expenses),
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

async def calculate_chart_data(
    user_id: UUID, period: str, db: AsyncSession
) -> list[dict]:
    """Calculate historical data for chart over a period (1d, 7d, 1m, 1y)."""
    from collections import defaultdict
    today = date.today()
    
    if period == "1y":
        start_date = today.replace(day=1) - timedelta(days=365)
        start_date = start_date.replace(day=1)
    elif period == "1m":
        start_date = today - timedelta(days=29)
    elif period == "1d":
        start_date = today
    else:
        start_date = today - timedelta(days=6)
        
    stmt_tx = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date <= today,
        Transaction.is_deleted == False,
        Transaction.transaction_type == "sale"
    )
    result_tx = await db.execute(stmt_tx)
    transactions = result_tx.scalars().all()
    
    stmt_exp = select(Expense).where(
        Expense.user_id == user_id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= today,
        Expense.is_deleted == False,
        Expense.status == "confirmed"
    )
    result_exp = await db.execute(stmt_exp)
    expenses = result_exp.scalars().all()
    
    data = defaultdict(lambda: {"income": 0.0, "expense": 0.0, "profit": 0.0})
    
    for t in transactions:
        if period == "1y":
            key = t.transaction_date.strftime("%Y-%m")
        elif period == "1d":
            # For 1d, group by hour (from created_at). Note: created_at is UTC, we assume it's close enough or format it locally.
            # Using created_at.strftime("%H:00")
            key = t.created_at.astimezone().strftime("%H:00") if t.created_at else "00:00"
        else:
            key = t.transaction_date.strftime("%Y-%m-%d")
        data[key]["income"] += float(t.total_amount)
        
    for e in expenses:
        if period == "1y":
            key = e.expense_date.strftime("%Y-%m")
        elif period == "1d":
            key = e.created_at.astimezone().strftime("%H:00") if e.created_at else "00:00"
        else:
            key = e.expense_date.strftime("%Y-%m-%d")
        data[key]["expense"] += float(e.total_actual)
        
    result = []
    # Only return dates/times that have data, sorted by label
    for key in sorted(data.keys()):
        income = data[key]["income"]
        expense = data[key]["expense"]
        profit = income - expense
        result.append({"label": key, "income": income, "expense": expense, "profit": profit})
        
    return result
