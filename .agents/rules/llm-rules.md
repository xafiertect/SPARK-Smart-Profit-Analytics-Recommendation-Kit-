# SPARK — LLM Interaction & Prompting Rules
**Gemini · Prompt Engineering · Deterministic Fallbacks · Pydantic Validation**

---

## Core Philosophy

- **LLM is for reasoning and explanation, not calculating.**
- **Never trust raw LLM output.** Always validate against strict schemas.
- **Graceful degradation is mandatory.** If the LLM times out or fails, the core system must still work.
- **Protect user context.** Only send the data necessary for the task at hand.

---

## 1. Prompt Engineering Standards

### Clarity and Constraints
Prompts must be explicit about what the LLM should *do* and what it should *not do*.

```python
# ✅ Correct: Strict instructions and constraints
PROMPT = """
You are a data extraction assistant. Return ONLY a valid JSON object. No explanation. No markdown.
Format:
{{
  "transaction_date": "YYYY-MM-DD",
  ...
}}
Rules:
- Do not invent numbers.
- If unsure, use null.
"""

# ❌ Wrong: Vague instructions
PROMPT = "Tolong ekstrak nota ini menjadi JSON."
```

### Language Setting
Selalu instruksikan LLM untuk menggunakan bahasa yang membumi, mudah dipahami (awam/UMKM), dan **Bahasa Indonesia** kecuali diminta sebaliknya oleh user.

```python
LANGUAGE_RULE = """
- Write in simple, conversational Bahasa Indonesia.
- Avoid technical jargon. Write like you're talking to a friend.
- Keep it concise. Max 3-4 sentences.
"""
```

---

## 2. LLM Output Validation (Pydantic)

Jangan pernah mem-parsing string JSON dari LLM langsung ke database tanpa validasi. Gunakan **Pydantic** sebagai *shield*.

```python
class ParsedReceipt(BaseModel):
    transaction_date: date | None
    items: list[ParsedReceiptItem]
    total_amount: float | None
    confidence: Literal["high", "medium", "low"]

def parse_llm_output(raw_json_string: str) -> ParsedReceipt:
    try:
        # LLM might wrap response in markdown blocks like ```json ... ```
        cleaned_str = raw_json_string.strip("```json").strip("```").strip()
        data = json.loads(cleaned_str)
        return ParsedReceipt(**data)
    except (json.JSONDecodeError, ValidationError) as e:
        logger.error(f"LLM Parsing failed: {str(e)}")
        raise LLMParseError("LLM returned invalid format. Fallback to manual input.")
```

---

## 3. Timeout and Fallback Handling

Karena sifat LLM yang bergantung pada koneksi jaringan dan waktu inferensi, setiap pemanggilan wajib menggunakan **Timeout**.

```python
import asyncio

async def call_llm_with_timeout(prompt: str, timeout_seconds: int = 15) -> str:
    try:
        async with asyncio.timeout(timeout_seconds):
            # Asumsi llm_client adalah wrapper async untuk Gemini
            return await llm_client.generate_content_async(prompt)
    except TimeoutError:
        logger.warning("LLM request timed out")
        raise LLMTimeoutError("LLM took too long. Proceeding with fallback logic.")
```

**Aturan Fallback:**
- Jika OCR (Vision) lambat/gagal: Tampilkan form manual kosong kepada pengguna.
- Jika AI Agent Insight lambat/gagal: Hanya simpan *trigger* rule-based tanpa penjelasan AI.

---

## 4. Peran LLM dalam Sistem (The Boundary)

**Aturan Emas:** LLM tidak boleh membuat keputusan matematis (Financial Engine) atau menentukan *trigger* secara probabilistik.

**Cara yang Benar (Hybrid AI):**
1. **Rule-Based System** mendeteksi bahwa stok < 3 hari. (Ini adalah kepastian deterministik).
2. Sistem mengumpulkan metrik ini ke dalam objek `BusinessContext`.
3. Objek `BusinessContext` diberikan kepada **LLM** untuk diubah menjadi wawasan tekstual yang ramah pengguna.

*Pemisahan wewenang ini memastikan angka uang dan stok tidak pernah terhalusinasi oleh LLM.*

---

## 5. Keamanan dan Batasan Konteks

- **No PII Leakage:** Jangan mengirim data sensitif pengguna (password, email, sesi token) ke prompt LLM.
- **Context Limit:** Batasi riwayat transaksi yang dikirim ke LLM maksimal 7-30 hari terakhir agar tidak terkena token limit dan menjaga latensi tetap rendah.
- **System Prompt Integrity:** Saat membuat fitur Chat Consultant, pastikan *System Prompt* tidak bisa di-override oleh pesan dari user (mencegah Prompt Injection).

---

## 6. Integrasi RAG (Retrieval-Augmented Generation) untuk Pengetahuan Bisnis

Sistem (AI Agent) harus menggunakan pendekatan RAG untuk memperkaya respons Gemini. Selain mengandalkan data transaksi pengguna (`BusinessContext`), sistem harus dapat menarik informasi dari *Knowledge Base* bisnis (seperti tips pengelolaan *cash flow* UMKM, strategi diskon, dsb).
- **Konteks Dinamis:** Gemini harus memadukan data bisnis pengguna (angka nyata) dengan praktik bisnis terbaik (dari RAG) untuk memberikan saran yang lebih cerdas dan *actionable*.

---

## 7. Interaksi Dinamis dan Personal (Anti-Template)

Jawaban dari Gemini **tidak boleh bersifat template kaku**.
- **Natural & Interaktif:** AI harus menjawab layaknya seorang konsultan bisnis manusia. Tuliskan jawaban yang dinamis, bervariasi, dan sesuaikan nada (tone) dengan kondisi bisnis pengguna (misal: menyemangati jika *cashflow* turun, memuji jika laba naik).
- **Koneksi Langsung (Real-time):** Interaksi harus diteruskan langsung ke Gemini agar jawaban yang dihasilkan spesifik menjawab pertanyaan pengguna saat itu juga, memicu obrolan yang natural dua arah.
