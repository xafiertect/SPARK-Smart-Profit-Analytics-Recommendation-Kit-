from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.transaction import Transaction, TransactionItem
from schemas.transaction import TransactionCreateIn, TransactionOut, DailySummaryOut
from services.financial_engine import update_stock, calculate_daily_summary

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionOut])
async def list_transactions(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Transaction)
        .options(selectinload(Transaction.items))
        .where(Transaction.user_id == current_user.id, Transaction.is_deleted == False)
    )
    if date_from:
        stmt = stmt.where(Transaction.transaction_date >= date_from)
    if date_to:
        stmt = stmt.where(Transaction.transaction_date <= date_to)
    stmt = stmt.order_by(Transaction.created_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=TransactionOut, status_code=201)
async def create_transaction(
    data: TransactionCreateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Build items and calculate total
    items = []
    total = 0.0
    for item_data in data.items:
        subtotal = item_data.subtotal or (item_data.quantity * item_data.unit_price)
        items.append(TransactionItem(
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            subtotal=subtotal,
        ))
        total += subtotal

    txn = Transaction(
        user_id=current_user.id,
        transaction_type=data.transaction_type,
        total_amount=total,
        source=data.source,
        transaction_date=data.transaction_date,
        notes=data.notes,
        items=items,
    )
    db.add(txn)

    # Update stock for each item
    for item_data in data.items:
        await update_stock(
            current_user.id, item_data.product_name,
            item_data.quantity, data.transaction_type, db,
        )

    await db.commit()
    await db.refresh(txn, ["items"])
    return txn


@router.get("/{transaction_id}", response_model=TransactionOut)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.items))
        .where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.is_deleted == False,
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return txn
