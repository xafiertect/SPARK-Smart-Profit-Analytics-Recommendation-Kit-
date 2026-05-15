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
    product = Product(user_id=current_user.id, **data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)

    if product.current_stock > 0:
        from models.expense import Expense
        from datetime import date
        expense = Expense(
            user_id=current_user.id,
            name=f"Pembelian Stok: {product.name}",
            expense_date=date.today(),
            category="Pembelian Stok",
            related_product_id=product.id,
            related_product_name=product.name,
            stock_quantity=product.current_stock,
            unit_price_snapshot=product.base_price,
            total_default=product.current_stock * product.base_price,
            total_actual=product.current_stock * product.base_price,
            source="auto-tambah-stok",
            status="draft",
        )
        db.add(expense)
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

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    diff = product.current_stock - old_stock
    if diff > 0:
        from models.expense import Expense
        from datetime import date
        expense = Expense(
            user_id=current_user.id,
            name=f"Pembelian Stok: {product.name}",
            expense_date=date.today(),
            category="Pembelian Stok",
            related_product_id=product.id,
            related_product_name=product.name,
            stock_quantity=diff,
            unit_price_snapshot=product.base_price,
            total_default=diff * product.base_price,
            total_actual=diff * product.base_price,
            source="auto-tambah-stok",
            status="draft",
        )
        db.add(expense)
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
