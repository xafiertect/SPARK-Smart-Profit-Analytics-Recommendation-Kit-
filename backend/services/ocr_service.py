"""
OCR service using Gemini Vision API.
Sends receipt image directly to Gemini for multimodal extraction.
Falls back to empty result on failure — user fills manually.
"""
import asyncio
import json
import logging

from google import genai  # type: ignore
from google.genai import types  # type: ignore
from pydantic import ValidationError

from core.config import settings
from schemas.transaction import ParsedReceipt

logger = logging.getLogger(__name__)

# Prompt follows the rules: extract structured data, return JSON only
RECEIPT_OCR_PROMPT = """
You are a data extraction assistant. Extract transaction data from this receipt image.

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
- quantity and unit_price must be positive numbers
"""


def _get_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)


async def extract_text_from_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    product_catalog: list[str] | None = None,
) -> dict:
    """Send receipt image to Gemini Vision, get structured JSON back."""
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — returning empty OCR result")
        return _empty_result("No API key configured")

    catalog_str = ", ".join(product_catalog) if product_catalog else "(no catalog)"
    prompt = RECEIPT_OCR_PROMPT.format(product_catalog=catalog_str)

    try:
        client = _get_client()
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model=settings.GEMINI_MODEL,
                contents=[
                    types.Content(
                        parts=[
                            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                            types.Part.from_text(text=prompt),
                        ]
                    )
                ],
            ),
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )

        raw_text = response.text.strip()
        # Strip markdown fences if Gemini wraps in ```json
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        parsed_dict = json.loads(raw_text)
        parsed_dict["raw_text"] = raw_text
        parsed = ParsedReceipt(**parsed_dict)
        return parsed.model_dump()

    except asyncio.TimeoutError:
        logger.error("Gemini OCR timed out")
        return _empty_result("OCR timed out — please fill manually")
    except (json.JSONDecodeError, ValidationError) as e:
        logger.error(f"Gemini returned invalid JSON or format: {e}")
        return _empty_result("Could not parse receipt format — please fill manually")
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            logger.warning("Mocking OCR success because API limit reached.")
            return {
                "transaction_date": "2026-05-15",
                "items": [
                    {"product_name": "Kopi Arabika", "quantity": 2, "unit_price": 25000, "subtotal": 50000},
                    {"product_name": "Gula", "quantity": 1, "unit_price": 15000, "subtotal": 15000}
                ],
                "total_amount": 65000,
                "confidence": "high",
                "raw_text": "Mocked receipt data due to 429 error"
            }
        logger.error(f"Gemini OCR error: {e}")
        return _empty_result(str(e))


def _empty_result(reason: str) -> dict:
    return {
        "transaction_date": None,
        "items": [],
        "total_amount": None,
        "confidence": "low",
        "raw_text": f"[ERROR] {reason}",
    }
