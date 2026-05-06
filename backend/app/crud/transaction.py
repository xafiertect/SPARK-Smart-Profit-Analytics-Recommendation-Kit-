from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from uuid import UUID
from app.models import Transaction, TransactionItem, Product
from app.schemas.transaction import TransactionCreate

async def create_transaction_with_stock_update(db: AsyncSession, payload: TransactionCreate, owner_id: UUID):
    try:
        # 1. Create the parent transaction record
        db_transaction = Transaction(total_amount=payload.total_nota, owner_id=owner_id)
        db.add(db_transaction)
        await db.flush()

        # 2. Process each item
        for item in payload.items:
            # Cari produk di database milik user ini
            result = await db.execute(
                select(Product).filter(Product.name == item.nama, Product.owner_id == owner_id)
            )
            db_product = result.scalars().first()

            if not db_product:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Produk '{item.nama}' tidak ditemukan di database Anda."
                )

            # Update stok
            if db_product.stock_quantity < item.qty:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Stok '{item.nama}' tidak mencukupi. Sisa: {db_product.stock_quantity}."
                )
            
            db_product.stock_quantity -= item.qty

            db_item = TransactionItem(
                transaction_id=db_transaction.id,
                product_id=db_product.id,
                product_name=item.nama,
                qty=item.qty,
                price=item.harga,
                subtotal=item.subtotal
            )
            db.add(db_item)

        await db.commit()
        await db.refresh(db_transaction, ['items'])
        return db_transaction

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal memproses transaksi: {str(e)}")
