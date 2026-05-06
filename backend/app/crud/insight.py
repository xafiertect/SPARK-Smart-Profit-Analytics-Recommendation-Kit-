from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from app.models import Product, TransactionItem, Transaction
import json

async def get_business_context(db: AsyncSession, owner_id: UUID):
    # 1. Get user's products
    result_products = await db.execute(select(Product).filter(Product.owner_id == owner_id))
    products = result_products.scalars().all()
    
    # Kriteria: Stok di bawah 15
    low_stock_products = [
        {"name": p.name, "stock": p.stock_quantity, "category": p.category}
        for p in products if p.stock_quantity < 15
    ]
    
    # 2. Get transaction velocity for user
    result_sales = await db.execute(
        select(
            TransactionItem.product_name, 
            func.sum(TransactionItem.qty).label('total_sold')
        ).join(Transaction).filter(Transaction.owner_id == owner_id).group_by(TransactionItem.product_name)
    )
    sales_data = result_sales.all()
    
    sales_velocity = [
        {"name": row.product_name, "total_sold": row.total_sold}
        for row in sales_data
    ]

    # 3. Financial Summary (Step 6)
    result_finance = await db.execute(
        select(func.sum(Transaction.total_amount)).filter(Transaction.owner_id == owner_id)
    )
    total_income = result_finance.scalar() or 0

    context = {
        "low_stock_alerts": low_stock_products,
        "sales_velocity": sales_velocity,
        "total_income": float(total_income),
        "total_products_tracked": len(products)
    }
    
    return json.dumps(context, indent=2)
