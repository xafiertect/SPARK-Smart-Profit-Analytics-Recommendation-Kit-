from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.product import Product
from schemas.product import ProductCreateIn, ProductUpdateIn, ProductOut

router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.get("/", response_model=list[ProductOut])
async def list_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .where(Product.user_id == current_user.id, Product.is_deleted == False)
        .order_by(Product.name)
    )
    return result.scalars().all()


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_data = data.model_dump(exclude={"expense_action", "expense_total_actual"})
    product = Product(user_id=current_user.id, **product_data)
    db.add(product)
    await db.commit()
    await db.refresh(product)

    if product.current_stock > 0 and getattr(data, "expense_action", None) != "none":
        from models.expense import Expense
        from models.notification import Notification
        from datetime import date
        
        diff = product.current_stock
        expense_status = data.expense_action if data.expense_action in ["draft", "confirmed"] else "draft"
        total_default = diff * product.base_price
        total_actual = data.expense_total_actual if data.expense_total_actual is not None else total_default
        
        expense = Expense(
            user_id=current_user.id,
            name=f"Pembelian Stok: {product.name}",
            expense_date=date.today(),
            category="Pembelian Stok",
            related_product_id=product.id,
            related_product_name=product.name,
            stock_quantity=diff,
            unit_price_snapshot=product.base_price,
            total_default=total_default,
            total_actual=total_actual,
            source="auto-tambah-stok",
            status=expense_status,
        )
        db.add(expense)
        await db.flush()
        
        if expense.status == "draft":
            notif = Notification(
                user_id=current_user.id,
                type="EXPENSE_UNCONFIRMED",
                priority="ACTION_REQUIRED",
                title="Pengeluaran Belum Dikonfirmasi",
                message=f"Tambah stok {product.name} ({diff:g} unit) belum dicatat sebagai pengeluaran. Total estimasi: Rp {total_default:,.0f}. Konfirmasi di menu Pengeluaran.",
                related_product_id=product.id,
                action_data={"expense_id": str(expense.id)}
            )
            db.add(notif)
            
        await db.commit()

    return product


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: UUID,
    data: ProductUpdateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.user_id == current_user.id,
            Product.is_deleted == False,
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

    old_stock = product.current_stock

    for field, value in data.model_dump(exclude_unset=True, exclude={"expense_action", "expense_total_actual"}).items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    diff = product.current_stock - old_stock
    if diff > 0 and getattr(data, "expense_action", None) != "none":
        from models.expense import Expense
        from models.notification import Notification
        from datetime import date
        
        expense_status = data.expense_action if data.expense_action in ["draft", "confirmed"] else "draft"
        total_default = diff * product.base_price
        total_actual = data.expense_total_actual if data.expense_total_actual is not None else total_default
        
        expense = Expense(
            user_id=current_user.id,
            name=f"Pembelian Stok: {product.name}",
            expense_date=date.today(),
            category="Pembelian Stok",
            related_product_id=product.id,
            related_product_name=product.name,
            stock_quantity=diff,
            unit_price_snapshot=product.base_price,
            total_default=total_default,
            total_actual=total_actual,
            source="auto-tambah-stok",
            status=expense_status,
        )
        db.add(expense)
        await db.flush()
        
        if expense.status == "draft":
            notif = Notification(
                user_id=current_user.id,
                type="EXPENSE_UNCONFIRMED",
                priority="ACTION_REQUIRED",
                title="Pengeluaran Belum Dikonfirmasi",
                message=f"Tambah stok {product.name} ({diff:g} unit) belum dicatat sebagai pengeluaran. Total estimasi: Rp {total_default:,.0f}. Konfirmasi di menu Pengeluaran.",
                related_product_id=product.id,
                action_data={"expense_id": str(expense.id)}
            )
            db.add(notif)
            
        await db.commit()

    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.user_id == current_user.id,
            Product.is_deleted == False,
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

    # Soft delete
    product.is_deleted = True
    await db.commit()
