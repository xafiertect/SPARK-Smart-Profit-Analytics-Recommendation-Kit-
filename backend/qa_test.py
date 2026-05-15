import asyncio
import json
from services.ocr_service import extract_text_from_image
from services.llm_service import chat_with_context
from core.config import settings

async def main():
    print("=== TESTING OCR SCAN ===")
    try:
        # Pass dummy bytes
        res = await extract_text_from_image(b"dummy")
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(e)
        
    print("\n=== TESTING AI CHAT ===")
    try:
        res2 = await chat_with_context("Bagaimana cara menaikkan penjualan Kopi Arabika?", {"products": []})
        print(res2)
    except Exception as e:
        print(e)

if __name__ == '__main__':
    asyncio.run(main())
