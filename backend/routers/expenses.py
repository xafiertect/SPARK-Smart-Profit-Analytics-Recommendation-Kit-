from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.expense import Expense
from schemas.expense import ExpenseCreateIn, ExpenseUpdateIn, ExpenseOut

router = APIRouter(prefix="/api/v1/expenses", tags=["expenses"])


@router.get("/", response_model=list[ExpenseOut])
async def list_expenses(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    category: str | None = Query(None),
    source: str | None = Query(None),
    status: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Expense)
        .where(Expense.user_id == current_user.id, Expense.is_deleted == False)
        .order_by(Expense.created_at.desc())
    )
    if date_from:
        stmt = stmt.where(Expense.expense_date >= date_from)
    if date_to:
        stmt = stmt.where(Expense.expense_date <= date_to)
    if category:
        stmt = stmt.where(Expense.category == category)
    if source:
        stmt = stmt.where(Expense.source == source)
    if status:
        stmt = stmt.where(Expense.status == status)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=ExpenseOut, status_code=201)
async def create_expense(
    data: ExpenseCreateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    expense = Expense(
        user_id=current_user.id,
        **data.model_dump(),
        status="confirmed" if data.source == "manual" else "draft",
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: UUID,
    data: ExpenseUpdateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
            Expense.is_deleted == False,
        )
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Pengeluaran tidak ditemukan")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{expense_id}/confirm", response_model=ExpenseOut)
async def confirm_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm a draft expense (RULE E-1 — draft → confirmed)."""
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
            Expense.is_deleted == False,
        )
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Pengeluaran tidak ditemukan")

    expense.status = "confirmed"
    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
            Expense.is_deleted == False,
        )
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Pengeluaran tidak ditemukan")

    # Soft delete
    expense.is_deleted = True
    await db.commit()
