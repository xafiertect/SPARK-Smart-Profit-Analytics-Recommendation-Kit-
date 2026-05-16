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
    new_product_names = []
    
    # Build items and calculate total
    items = []
    total = 0.0
    for item_data in data.items:
        if getattr(item_data, "is_new_product", False):
            from models.product import Product
            new_stock = item_data.quantity if getattr(item_data, "add_new_stock", False) else 0
            new_prod = Product(
                user_id=current_user.id,
                name=item_data.product_name,
                category="⚠️ Perlu Verifikasi",
                unit="pcs",
                base_price=0,
                sell_price=item_data.unit_price,
                current_stock=new_stock,
            )
            db.add(new_prod)
            new_product_names.append(item_data.product_name)
            item_data.reduce_stock = False # Don't deduct it again

        subtotal = item_data.subtotal or (item_data.quantity * item_data.unit_price)
        items.append(TransactionItem(
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            subtotal=subtotal,
        ))
        total += subtotal

    final_total = data.total_amount if data.total_amount is not None else total

    txn = Transaction(
        user_id=current_user.id,
        transaction_type=data.transaction_type,
        total_amount=final_total,
        source=data.source,
        transaction_date=data.transaction_date,
        notes=data.notes,
        items=items,
    )
    db.add(txn)

    # Update stock for each item
    for item_data in data.items:
        if item_data.reduce_stock is not False:
            await update_stock(
                current_user.id, item_data.product_name,
                item_data.quantity, data.transaction_type, db,
            )

    # RULE E-1 — Auto-create draft expense on purchase
    if data.transaction_type == "purchase":
        from models.expense import Expense
        from models.product import Product as ProductModel

        for item_data in data.items:
            # Lookup product for base_price snapshot
            prod_result = await db.execute(
                select(ProductModel).where(
                    ProductModel.user_id == current_user.id,
                    ProductModel.name == item_data.product_name,
                    ProductModel.is_deleted == False,
                )
            )
            prod = prod_result.scalar_one_or_none()
            unit_price = float(item_data.unit_price)
            subtotal = item_data.subtotal or (item_data.quantity * unit_price)

            expense = Expense(
                user_id=current_user.id,
                name=f"Pembelian Stok: {item_data.product_name}",
                expense_date=data.transaction_date,
                category="Pembelian Stok",
                related_product_id=prod.id if prod else None,
                related_product_name=item_data.product_name,
                stock_quantity=item_data.quantity,
                unit_price_snapshot=unit_price,
                total_default=subtotal,
                total_actual=subtotal,
                source="auto-tambah-stok",
                status="draft",
            )
            db.add(expense)

    if new_product_names:
        from models.notification import Notification
        notif_msg = f"Produk {', '.join(new_product_names)} otomatis ditambahkan ke daftar stok. Harga beli dan stok minimal belum diatur. Silakan lengkapi data produk."
        notif = Notification(
            user_id=current_user.id,
            type="NEW_PRODUCT_AUTO_REGISTER",
            priority="INFO",
            title="Produk Baru Didaftarkan dari Input Manual",
            message=notif_msg,
            action_data={"redirect": "/products"}
        )
        db.add(notif)

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
