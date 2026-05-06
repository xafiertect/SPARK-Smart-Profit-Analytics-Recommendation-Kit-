import os
import json
import logging
import google.generativeai as genai
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Configure Gemini API
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    logger.error("GEMINI_API_KEY is not set in environment variables.")

# Use Gemini 1.5 Flash for stable free-tier quota
MODEL_NAME = "gemini-1.5-flash"

async def parse_receipt_data(raw_ocr_text: str, baseline_product_names: List[str]) -> Dict[str, Any]:
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY is missing. Cannot use parsing engine.")

    model = genai.GenerativeModel(MODEL_NAME)

    prompt = f"""
Anda adalah asisten AI ahli ekstraksi data (SPARK Parsing Engine).
Tugas Anda: Mengubah teks mentah hasil OCR dari nota belanja menjadi format JSON murni.

Teks Mentah OCR:
---
{raw_ocr_text}
---

Daftar Produk Baseline (Gunakan untuk pencocokan nama yang akurat):
[{', '.join(baseline_product_names)}]

Aturan Ekstraksi:
1. Ekstrak: nama barang, qty, harga satuan (harga), dan subtotal.
2. BASELINE MATCHING: Jika nama barang di nota mirip dengan salah satu produk di "Daftar Produk Baseline", GUNAKAN NAMA DARI BASELINE.
3. DATA TYPES: Pastikan qty (int), harga (int), dan subtotal (int) adalah angka tanpa titik/koma ribuan.
4. FORMAT: Output WAJIB berupa JSON murni tanpa teks tambahan, tanpa markdown ```json.

Skema JSON:
{{
  "items": [
    {{"nama": "Nama Produk", "qty": 1, "harga": 10000, "subtotal": 10000}}
  ],
  "total_nota": 10000
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Robust cleaning for any markdown wrappers
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:].strip()
        
        text = text.strip()
        parsed_data = json.loads(text)
        
        # Final validation of keys
        if "items" not in parsed_data:
            raise ValueError("JSON missing 'items' key")
            
        return parsed_data
    except json.JSONDecodeError as je:
        logger.error(f"LLM returned invalid JSON: {text}. Error: {str(je)}")
        raise RuntimeError(f"Format data dari AI tidak valid: {str(je)}")
    except Exception as e:
        logger.error(f"Failed to parse receipt data with LLM: {str(e)}")
        raise RuntimeError(f"Gagal memproses data dengan AI: {str(e)}")
