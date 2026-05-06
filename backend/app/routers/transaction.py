from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.crud.transaction import create_transaction_with_stock_update
from app.auth import get_current_user
from app.models import User

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_transaction_with_stock_update(db, transaction_data, owner_id=current_user.id)
