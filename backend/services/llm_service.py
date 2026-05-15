"""
LLM service powered by Google Gemini.
Handles: receipt text correction, AI consultant chat, agent explanations.
Integrates RAG knowledge base for broader business consulting.
"""
import asyncio
import json
import logging


from google import genai  # type: ignore
from google.genai import types  # type: ignore
from pydantic import ValidationError

from core.config import settings
from schemas.transaction import ParsedReceipt
from services.rag_knowledge import get_rag_knowledge_for_query

logger = logging.getLogger(__name__)

# ── Prompt templates ────────────────────────────────────────────────

CONSULTANT_SYSTEM_PROMPT = """
You are SPARK, a friendly and knowledgeable financial & business consultant for small business owners (UMKM) in Indonesia.
You help them understand their business data, make smart decisions, and grow their business.

## Your Capabilities
You can answer questions about:
- Keuangan: cash flow, profit, margin, pengeluaran, modal, utang
- Marketing: strategi promosi, branding, digital marketing, social media
- Penjualan: meningkatkan omzet, upselling, cross-selling, layanan pelanggan
- Stok & Inventory: manajemen stok, supplier, reorder point
- Operasional: efisiensi, SOP, manajemen karyawan
- Pengembangan Bisnis: scaling, ekspansi, legalitas, perizinan
- Tips Umum: motivasi, mindset pengusaha, best practices UMKM

## Rules
- Selalu gunakan bahasa yang membumi, sederhana, dan hindari jargon bisnis yang rumit.
- Jawablah layaknya konsultan manusia: dinamis, tidak kaku (anti-template), empatik, dan berikan dorongan positif sesuai kondisi bisnis pengguna.
- Gunakan data `Business Context` sebagai fondasi utama untuk pertanyaan yang berkaitan dengan data bisnis pengguna.
- Gunakan `Knowledge Base` untuk memperkaya jawaban dengan tips dan strategi bisnis yang relevan.
- Padukan kedua sumber informasi ini untuk memberikan saran yang actionable dan kontekstual.
- Jangan pernah mengarang angka transaksi atau data bisnis yang tidak ada di Business Context.
- Buat jawaban yang interaktif dan memancing diskusi (misal bertanya balik tentang target mereka).
- Jika pertanyaan sangat di luar konteks bisnis/keuangan (misal: resep masakan, politik), arahkan kembali dengan sopan.
- Jawaban maksimal 4-6 kalimat, kecuali user meminta penjelasan lebih detail.
- Tulis dalam Bahasa Indonesia kecuali user menulis dalam bahasa lain.

## Business Context (Data Nyata Pengguna)
{business_context}

## Knowledge Base (Pengetahuan Bisnis Umum)
{rag_knowledge}
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


async def _call_gemini(prompt: str, max_retries: int = 2) -> str:
    """Call Gemini with timeout and retry on rate limit."""
    client = _get_client()
    last_error = None

    for attempt in range(max_retries + 1):
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                ),
                timeout=settings.LLM_TIMEOUT_SECONDS,
            )
            return response.text.strip()
        except asyncio.TimeoutError:
            logger.warning("Gemini call timed out (attempt %d/%d)", attempt + 1, max_retries + 1)
            last_error = "timeout"
            break  # Don't retry on timeout
        except Exception as e:
            error_str = str(e)
            last_error = error_str
            # Retry on rate limit (429)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = min(5 * (attempt + 1), 15)
                logger.warning(
                    "Gemini rate limited (attempt %d/%d), waiting %ds...",
                    attempt + 1, max_retries + 1, wait_time
                )
                if attempt < max_retries:
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.warning("Mocking LLM success because API limit reached.")
                    return "💡 [MOCK AI] Ini adalah respons cerdas (simulasi) karena kuota Gemini habis! Berdasarkan datamu, pastikan stok Kopi Arabika selalu aman karena punya margin profit yang bagus. Coba tawarkan diskon bundel dengan produk lain."
            # Don't retry on other errors
            logger.error("Gemini error (attempt %d/%d): %s", attempt + 1, max_retries + 1, e)
            break

    raise Exception(f"Gemini failed after retries: {last_error}")


# ── Public API ──────────────────────────────────────────────────────

async def chat_with_context(message: str, business_context: dict, history: list[dict] | None = None) -> str:
    """AI consultant chat — answers user questions about their business.
    Integrates RAG knowledge base for broader business topics."""
    if not settings.GEMINI_API_KEY:
        return _fallback_chat(message, business_context)

    try:
        ctx_str = _format_context_readable(business_context)

        # RAG: retrieve relevant knowledge based on the user's question
        rag_knowledge = get_rag_knowledge_for_query(message, top_k=3)

        system = CONSULTANT_SYSTEM_PROMPT.format(
            business_context=ctx_str,
            rag_knowledge=rag_knowledge if rag_knowledge else "(Tidak ada knowledge base yang relevan untuk pertanyaan ini)"
        )
        
        full_prompt = f"{system}\n\n"
        if history:
            for h in history:
                role = "User" if h.get("role") == "user" else "SPARK"
                full_prompt += f"{role}: {h.get('content', '')}\n"
                
        full_prompt += f"User: {message}\nSPARK:"
        
        return await _call_gemini(full_prompt)
    except asyncio.TimeoutError:
        logger.error("Gemini chat timed out")
        return "Maaf, saya butuh waktu lebih lama. Coba lagi dalam beberapa detik ya! ⏳"
    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        return _fallback_chat(message, business_context)


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

        parsed_dict = json.loads(raw_response)
        parsed = ParsedReceipt(**parsed_dict)
        return parsed.model_dump()
    except (json.JSONDecodeError, ValidationError) as e:
        logger.error(f"Gemini OCR correction validation error: {e}")
        return None
    except Exception as e:
        logger.error(f"Gemini OCR correction error: {e}")
        return None


# ── Context Formatter ───────────────────────────────────────────────

def _format_context_readable(ctx: dict) -> str:
    """Format business context as human-readable text for better LLM understanding."""
    lines = []

    # Products
    products = ctx.get("products", [])
    if products:
        lines.append("=== Daftar Produk ===")
        for p in products:
            stock = p.get("current_stock", 0)
            name = p.get("name", "?")
            sell = p.get("sell_price", 0)
            threshold = p.get("min_stock_threshold", 0)
            status = "⚠️ STOK RENDAH" if stock <= threshold else "✅"
            lines.append(f"- {name}: stok={stock}, harga jual=Rp{sell:,.0f} {status}")
    else:
        lines.append("Belum ada produk terdaftar.")

    # Sales averages
    daily_avg = ctx.get("daily_sales_avg", {})
    if daily_avg:
        lines.append("\n=== Rata-rata Penjualan Harian (7 hari) ===")
        for name, avg in daily_avg.items():
            lines.append(f"- {name}: {avg:.1f} unit/hari")

    # Weekly expense comparison
    this_week = ctx.get("this_week_expense", 0)
    last_week = ctx.get("last_week_expense", 0)
    lines.append(f"\n=== Pengeluaran ===")
    lines.append(f"- Minggu ini: Rp{this_week:,.0f}")
    lines.append(f"- Minggu lalu: Rp{last_week:,.0f}")
    if last_week > 0:
        change = ((this_week - last_week) / last_week) * 100
        direction = "naik" if change > 0 else "turun"
        lines.append(f"- Perubahan: {direction} {abs(change):.0f}%")

    # Stock levels
    stock_levels = ctx.get("stock_levels", {})
    if stock_levels:
        lines.append(f"\n=== Level Stok ===")
        for name, level in stock_levels.items():
            lines.append(f"- {name}: {level}")

    return "\n".join(lines)


# ── Fallbacks (when API key missing or LLM fails) ──────────────────

def _fallback_chat(message: str, business_context: dict = None) -> str:
    """Smart fallback using actual business data + RAG knowledge when LLM is unavailable."""
    msg = message.lower()
    ctx = business_context or {}

    products = ctx.get("products", [])
    this_week_expense = ctx.get("this_week_expense", 0)
    last_week_expense = ctx.get("last_week_expense", 0)
    daily_avg = ctx.get("daily_sales_avg", {})

    # Business data questions — use actual data
    if "keuntungan" in msg or "profit" in msg or "untung" in msg or "rugi" in msg:
        if this_week_expense > 0:
            return (
                f"Minggu ini pengeluaranmu sebesar Rp{this_week_expense:,.0f}. "
                f"Untuk melihat detail keuntungan, cek Dashboard ya! 💪"
            )
        return "Belum ada data transaksi minggu ini. Mulai catat transaksi untuk melihat keuntungan! 📝"

    if "stok" in msg or "stock" in msg or "habis" in msg:
        low_stock = [p for p in products if p.get("current_stock", 0) <= p.get("min_stock_threshold", 0)]
        if low_stock:
            names = ", ".join([p["name"] for p in low_stock[:3]])
            return f"⚠️ Produk dengan stok rendah: {names}. Segera restock supaya tidak kehabisan!"
        if products:
            return "Semua stok produkmu aman saat ini. Bagus! ✅"
        return "Belum ada produk terdaftar. Tambahkan produk dulu di halaman Produk."

    if "laris" in msg or "terjual" in msg or "penjualan" in msg or "tren" in msg:
        if daily_avg:
            sorted_sales = sorted(daily_avg.items(), key=lambda x: x[1], reverse=True)
            top = sorted_sales[0]
            return f"Produk paling laris: {top[0]} dengan rata-rata {top[1]:.1f} unit/hari (7 hari terakhir). 🔥"
        return "Belum ada data penjualan. Catat transaksi pertamamu untuk melihat tren!"

    if "pengeluaran" in msg or "belanja" in msg or "expense" in msg:
        if this_week_expense > 0:
            diff_text = ""
            if last_week_expense > 0:
                change = ((this_week_expense - last_week_expense) / last_week_expense) * 100
                direction = "naik" if change > 0 else "turun"
                diff_text = f" ({direction} {abs(change):.0f}% dari minggu lalu)"
            return f"Pengeluaran minggu ini: Rp{this_week_expense:,.0f}{diff_text}."
        return "Belum ada data pengeluaran minggu ini."

    if "produk" in msg:
        if products:
            names = ", ".join([p["name"] for p in products[:5]])
            return f"Kamu punya {len(products)} produk terdaftar: {names}{'...' if len(products) > 5 else ''}."
        return "Belum ada produk terdaftar. Tambahkan di halaman Produk ya!"

    # Business knowledge questions — use RAG fallback
    rag_knowledge = get_rag_knowledge_for_query(message, top_k=1)
    if rag_knowledge:
        return (
            f"Saat ini koneksi AI sedang terganggu, tapi berikut tips yang relevan:\n\n"
            f"{rag_knowledge}\n\n"
            f"Untuk jawaban yang lebih spesifik tentang bisnismu, coba tanya lagi nanti ya! 😊"
        )

    # Generic response with context awareness
    if products:
        return (
            f"Saat ini kamu punya {len(products)} produk terdaftar. "
            f"Tanyakan tentang stok, keuntungan, pengeluaran, strategi marketing, "
            f"tips penjualan, atau tren penjualan dan saya akan bantu analisis! 😊"
        )
    return (
        "Halo! Saya SPARK AI, asisten bisnis kamu. "
        "Kamu bisa bertanya tentang keuangan, marketing, penjualan, stok, "
        "dan tips mengembangkan bisnis. Mulai dengan menambahkan produk "
        "dan mencatat transaksi ya! 🚀"
    )


def _fallback_explanation(trigger_type: str, trigger_data: dict) -> str:
    if trigger_type == "LOW_STOCK":
        name = trigger_data.get("product_name", "produk")
        stock = trigger_data.get("current_stock", 0)
        return f"Stok {name} tinggal {stock:.0f}. Segera restock supaya tidak kehabisan!"
    if trigger_type == "EXPENSE_SPIKE":
        pct = trigger_data.get("increase_pct", 0)
        return f"Pengeluaran minggu ini naik {pct:.0f}% dari minggu lalu. Cek ada pembelian besar?"
    if trigger_type == "SUMMARY":
        total = trigger_data.get("total_products", 0)
        stock = trigger_data.get("stock_levels", {})
        safe = all(v > 0 for v in stock.values()) if stock else True
        status = "Semua stok aman ✅" if safe else "Ada stok yang perlu dicek"
        return f"Ringkasan bisnis: {total} produk terdaftar. {status}. Terus catat transaksi untuk insight yang lebih akurat! 💪"
    return "Ada hal yang perlu diperhatikan di bisnis kamu."
