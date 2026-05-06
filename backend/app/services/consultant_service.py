import os
import logging
import google.generativeai as genai
from typing import List, Dict, Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Config Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-1.5-flash"

async def get_consultant_response(user_query: str, business_context: str) -> str:
    if not API_KEY:
        return "Layanan konsultasi AI tidak tersedia (API Key missing)."

    model = genai.GenerativeModel(MODEL_NAME)
    
    prompt = f"""
Anda adalah 'SPARK Consultant', asisten ahli bisnis UMKM. 
Tugas Anda adalah memberikan saran strategis dan jawaban atas pertanyaan pengguna berdasarkan data bisnis aktual mereka.

KONTEKS BISNIS USER (JSON):
{business_context}

PERTANYAAN USER:
"{user_query}"

Instruksi:
1. Berikan jawaban yang profesional, empatik, dan berbasis data.
2. Jika data tidak mencukupi untuk menjawab, sampaikan dengan jujur dan berikan saran umum yang relevan.
3. Fokus pada peningkatan profit, efisiensi stok, dan pertumbuhan bisnis.
4. Gunakan Bahasa Indonesia yang mudah dimengerti penjual.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error in AI Consultant: {str(e)}")
        return f"Maaf, terjadi kesalahan saat berkonsultasi dengan AI: {str(e)}"
