from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from app.models import Transaction, TransactionItem, Product

async def get_financial_summary(db: AsyncSession, owner_id: UUID):
    # Total Income
    income_result = await db.execute(
        select(func.sum(Transaction.total_amount)).filter(Transaction.owner_id == owner_id)
    )
    total_income = income_result.scalar() or 0

    # Total Expense (based on cost price of sold items)
    # Join TransactionItem with Product to get cost_price
    expense_result = await db.execute(
        select(func.sum(TransactionItem.qty * Product.cost_price))
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .join(Product, Product.id == TransactionItem.product_id)
        .filter(Transaction.owner_id == owner_id)
    )
    total_expense = expense_result.scalar() or 0

    profit = total_income - total_expense

    return {
        "income": float(total_income),
        "expense": float(total_expense),
        "profit": float(profit),
        "profit_margin": (float(profit) / float(total_income) * 100) if total_income > 0 else 0
    }
