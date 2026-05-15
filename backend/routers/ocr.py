from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.product import Product
from services.ocr_service import extract_text_from_image

router = APIRouter(prefix="/api/v1/ocr", tags=["ocr"])


@router.post("/scan")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload receipt image → Gemini Vision OCR → parsed JSON. User reviews before saving."""
    contents = await file.read()

    # Fetch user's product catalog for name matching
    stmt = select(Product.name).where(
        Product.user_id == current_user.id,
        Product.is_deleted == False,
    )
    result = await db.execute(stmt)
    catalog = [row[0] for row in result.all()]

    parsed = await extract_text_from_image(contents, mime_type=file.content_type, product_catalog=catalog)
    return parsed
