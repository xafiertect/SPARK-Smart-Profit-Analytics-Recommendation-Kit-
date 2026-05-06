from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.receipt import ReceiptExtractionResult
from app.crud.product import get_products
from app.services import ocr_service, llm_service
from app.auth import get_current_user
from app.models import User

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"],
)

@router.post("/process", response_model=ReceiptExtractionResult)
async def process_receipt(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar")
        
    try:
        # Read file contents in-memory
        image_bytes = await file.read()
        
        # 1. OCR Extraction
        raw_text = await ocr_service.extract_text_from_image(image_bytes)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Tidak ada teks yang dapat dibaca dari gambar nota.")
            
        # 2. Get Baseline Products for THIS user for matching
        products = await get_products(db, owner_id=current_user.id, limit=1000)
        baseline_names = [p.name for p in products]
        
        # 3. LLM Parsing & Data Cleaning
        parsed_json = await llm_service.parse_receipt_data(raw_text, baseline_names)
        
        return parsed_json
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal: {str(e)}")
