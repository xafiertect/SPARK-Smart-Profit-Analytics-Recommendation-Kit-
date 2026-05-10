"""
LLM service powered by Google Gemini.
Handles: receipt text correction, AI consultant chat, agent explanations.
"""
import asyncio
import json
import logging

from google import genai
from google.genai import types

from core.config import settings

logger = logging.getLogger(__name__)

# ── Prompt templates ────────────────────────────────────────────────

CONSULTANT_SYSTEM_PROMPT = """
You are SPARK, a friendly financial assistant for small business owners in Indonesia.
You help them understand their business data and make smart decisions.

Rules:
- Always use simple language. No jargon.
- Always base your answer on the provided business context data.
- Never make up numbers. If you don't have the data, say so.
- Be concise. Max 3-4 sentences per answer.
- Write in Bahasa Indonesia unless the user writes in English.

Business Context:
{business_context}
"""

AGENT_EXPLANATION_PROMPT = """
You are a friendly financial assistant for a small business owner in Indonesia.
A rule-based system detected the following issue:

Issue: {trigger_type}
Data: {trigger_data}
Business Context: {business_context}

Write a SHORT, clear recommendation in Bahasa Indonesia (2-3 sentences max).
Explain: what the problem is, why it matters, and what action to take.
Do NOT use technical terms. Write like you're talking to a friend.
"""

RECEIPT_CORRECTION_PROMPT = """
You are a data extraction assistant. Clean and structure this raw OCR text from a receipt.

OCR Text:
{ocr_text}

Known products catalog (for name matching):
{product_catalog}

Return ONLY a valid JSON object. No explanation. No markdown. Just the JSON.

Format:
{{
  "transaction_date": "YYYY-MM-DD or null",
  "items": [
    {{
      "product_name": "string",
      "quantity": number,
      "unit_price": number,
      "subtotal": number
    }}
  ],
  "total_amount": number,
  "confidence": "high|medium|low"
}}

Rules:
- Match product names to the catalog when possible
- If you can't read a value clearly, use null
- Do not invent numbers — if unsure, use null
- Date format must be YYYY-MM-DD
"""


def _get_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)


async def _call_gemini(prompt: str) -> str:
    """Call Gemini with timeout. Raises on failure."""
    client = _get_client()
    response = await asyncio.wait_for(
        asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=prompt,
        ),
        timeout=settings.LLM_TIMEOUT_SECONDS,
    )
    return response.text.strip()


# ── Public API ──────────────────────────────────────────────────────

async def chat_with_context(message: str, business_context: dict) -> str:
    """AI consultant chat — answers user questions about their business."""
    if not settings.GEMINI_API_KEY:
        return _fallback_chat(message)

    try:
        ctx_str = json.dumps(business_context, default=str, ensure_ascii=False)
        system = CONSULTANT_SYSTEM_PROMPT.format(business_context=ctx_str)
        full_prompt = f"{system}\n\nUser: {message}\nSPARK:"
        return await _call_gemini(full_prompt)
    except asyncio.TimeoutError:
        logger.error("Gemini chat timed out")
        return "Maaf, saya butuh waktu lebih lama. Coba lagi dalam beberapa detik ya! ⏳"
    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        return _fallback_chat(message)


async def generate_explanation(
    trigger_type: str,
    trigger_data: dict,
    business_context: dict,
) -> str:
    """Generate plain-language explanation for an AI agent trigger."""
    if not settings.GEMINI_API_KEY:
        return _fallback_explanation(trigger_type, trigger_data)

    try:
        prompt = AGENT_EXPLANATION_PROMPT.format(
            trigger_type=trigger_type,
            trigger_data=json.dumps(trigger_data, default=str, ensure_ascii=False),
            business_context=json.dumps(business_context, default=str, ensure_ascii=False),
        )
        return await _call_gemini(prompt)
    except Exception as e:
        logger.error(f"Gemini explanation error: {e}")
        return _fallback_explanation(trigger_type, trigger_data)


async def correct_ocr_text(
    raw_text: str,
    product_catalog: list[str] | None = None,
) -> dict | None:
    """Pipe raw OCR text through Gemini for correction and structuring."""
    if not settings.GEMINI_API_KEY:
        return None

    try:
        catalog_str = ", ".join(product_catalog) if product_catalog else "(no catalog)"
        prompt = RECEIPT_CORRECTION_PROMPT.format(
            ocr_text=raw_text,
            product_catalog=catalog_str,
        )
        raw_response = await _call_gemini(prompt)

        # Strip markdown fences
        if raw_response.startswith("```"):
            raw_response = raw_response.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        return json.loads(raw_response)
    except Exception as e:
        logger.error(f"Gemini OCR correction error: {e}")
        return None


# ── Fallbacks (when API key missing or LLM fails) ──────────────────

def _fallback_chat(message: str) -> str:
    msg = message.lower()
    if "keuntungan" in msg or "profit" in msg:
        return (
            "Berdasarkan data transaksi yang tercatat, keuntungan kamu hari ini "
            "berasal dari selisih harga jual dan beli. Cek dashboard ya! 💪"
        )
    if "stok" in msg or "stock" in msg:
        return (
            "Ada beberapa produk yang stoknya menipis. "
            "Cek halaman Produk untuk detail lengkapnya."
        )
    return (
        "Terima kasih pertanyaannya! Coba tanyakan tentang "
        "keuntungan, stok, atau tren penjualan ya! 😊"
    )


def _fallback_explanation(trigger_type: str, trigger_data: dict) -> str:
    if trigger_type == "LOW_STOCK":
        name = trigger_data.get("product_name", "produk")
        stock = trigger_data.get("current_stock", 0)
        return f"Stok {name} tinggal {stock:.0f}. Segera restock supaya tidak kehabisan!"
    if trigger_type == "EXPENSE_SPIKE":
        pct = trigger_data.get("increase_pct", 0)
        return f"Pengeluaran minggu ini naik {pct:.0f}% dari minggu lalu. Cek ada pembelian besar?"
    return "Ada hal yang perlu diperhatikan di bisnis kamu."
