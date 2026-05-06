from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.models import Product
from app.schemas.product import ProductCreate, ProductUpdate

async def get_product(db: AsyncSession, product_id: UUID, owner_id: UUID):
    result = await db.execute(
        select(Product).filter(Product.id == product_id, Product.owner_id == owner_id)
    )
    return result.scalars().first()

async def get_products(db: AsyncSession, owner_id: UUID, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Product).filter(Product.owner_id == owner_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_product_by_name(db: AsyncSession, name: str, owner_id: UUID):
    result = await db.execute(
        select(Product).filter(Product.name == name, Product.owner_id == owner_id)
    )
    return result.scalars().first()

async def create_product(db: AsyncSession, product: ProductCreate, owner_id: UUID):
    db_product = Product(**product.model_dump(), owner_id=owner_id)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, db_product: Product, product_update: ProductUpdate):
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def delete_product(db: AsyncSession, db_product: Product):
    await db.delete(db_product)
    await db.commit()
    return db_product
