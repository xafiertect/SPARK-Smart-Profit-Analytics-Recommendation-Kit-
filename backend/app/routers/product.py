from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud import product as crud_product
from app.auth import get_current_user
from app.models import User

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = await crud_product.get_product_by_name(db, name=product.name, owner_id=current_user.id)
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this name already exists")
    return await crud_product.create_product(db=db, product=product, owner_id=current_user.id)

@router.get("/", response_model=List[ProductResponse])
async def read_products(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = await crud_product.get_products(db, owner_id=current_user.id, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def read_product(
    product_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = await crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID, 
    product: ProductUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = await crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if name is being updated to an existing one for THIS user
    if product.name and product.name != db_product.name:
        existing_product = await crud_product.get_product_by_name(db, name=product.name, owner_id=current_user.id)
        if existing_product:
            raise HTTPException(status_code=400, detail="Product with this name already exists")
            
    return await crud_product.update_product(db=db, db_product=db_product, product_update=product)

@router.delete("/{product_id}", response_model=ProductResponse)
async def delete_product(
    product_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = await crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return await crud_product.delete_product(db=db, db_product=db_product)
