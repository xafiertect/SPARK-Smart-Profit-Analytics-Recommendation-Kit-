import asyncio
import os
from app.services.llm_service import parse_receipt_data

# Mock environment if needed
# os.environ["GEMINI_API_KEY"] = "YOUR_KEY" 

async def test():
    raw_text = "INDOMIE GORENG 2 PCS 6000\nTOTAL 6000"
    baseline = ["Indomie Goreng", "Sari Roti"]
    try:
        result = await parse_receipt_data(raw_text, baseline)
        print("Success:", result)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
