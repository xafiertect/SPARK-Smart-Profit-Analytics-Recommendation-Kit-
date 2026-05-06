import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set.")

MODEL_NAME = "gemini-1.5-flash" 

async def generate_business_insights(db_context: str) -> Dict[str, Any]:
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY is missing.")

    model = genai.GenerativeModel(MODEL_NAME)

    prompt = f"""
Anda adalah 'SPARK', sebuah Agen AI Konsultan Bisnis cerdas untuk UMKM.
Tugas Anda adalah menganalisis data inventaris dan riwayat penjualan yang diberikan di bawah ini, lalu memberikan rekomendasi bisnis yang *actionable*.

Anda HARUS menerapkan prinsip **Explainable AI**: Setiap rekomendasi (seperti restok, naikkan harga, atau buat diskon) harus disertai alasan logis dan perhitungan matematis berbasis data historis yang Anda terima.

Berikut adalah Konteks Data Bisnis (JSON):
{db_context}

Instruksi PENTING:
1. Temukan 2-3 wawasan (insight) paling krusial. Fokus pada ancaman kehabisan stok (low stock alerts) yang di-crosscheck dengan kecepatan penjualan (sales velocity).
2. Jika ada barang yang stoknya tipis (< 15) TETAPI penjualannya sangat lambat/nol, mungkin itu bukan prioritas restok. Sebaliknya, jika stok menipis dan penjualannya tinggi, itu adalah Prioritas Utama.
3. Kembalikan respons murni dalam format JSON ketat sesuai skema di bawah ini, TANPA blok markdown ```json.

Skema JSON Output HANYA seperti ini:
{{
  "insights": [
    {{
      "insight_title": "Prioritas Restok: Indomie Goreng",
      "recommendation": "Segera lakukan pemesanan 50 dus Indomie Goreng minggu ini.",
      "explanation": "Berdasarkan data, sisa stok saat ini hanya 8 unit. Mengingat riwayat penjualan mencapai 120 unit dalam periode terakhir, stok Anda diproyeksikan akan habis dalam 1-2 hari jika tingkat permintaan tetap sama."
    }}
  ]
}}
"""
    try:
        response = model.generate_content(prompt)
        raw_output = response.text.strip()
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()
            
        parsed_data = json.loads(raw_output)
        return parsed_data
    except Exception as e:
        logger.error(f"Gagal generate insight dengan LLM: {str(e)}")
        raise RuntimeError("Gagal menghasilkan insight dari AI Agent.")
