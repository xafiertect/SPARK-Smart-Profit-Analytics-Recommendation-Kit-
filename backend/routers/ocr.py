from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import difflib

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
    
    # Check for new products and auto-register
    new_products_created = False
    if "items" in parsed:
        for item in parsed["items"]:
            product_name = item.get("product_name", "")
            if not product_name:
                continue
                
            # Fuzzy match
            matches = difflib.get_close_matches(product_name, catalog, n=1, cutoff=0.8)
            if not matches:
                # Auto register new product
                new_product = Product(
                    user_id=current_user.id,
                    name=product_name,
                    current_stock=0,
                    base_price=0,
                    sell_price=item.get("unit_price", 0),
                    unit="pcs",
                    category="auto-OCR",
                )
                db.add(new_product)
                new_products_created = True
                
                # Flag for the frontend validation screen
                item["is_new_product"] = True
                item["flag"] = "⚠️ Perlu Verifikasi"
                
                # Add to catalog so subsequent items in the same scan don't duplicate it
                catalog.append(product_name)

    if new_products_created:
        await db.commit()

    return parsed

