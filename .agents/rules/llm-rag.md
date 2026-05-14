
# SPARK — LLM RAG (Retrieval-Augmented Generation) Rules
**Knowledge Base · Prompt Enrichment · Scope Control · Business Domain**

---

## Tujuan

Dokumen ini mengatur bagaimana sistem RAG (Retrieval-Augmented Generation) digunakan dalam SPARK untuk memperluas kemampuan AI Consultant agar dapat menjawab pertanyaan bisnis secara luas — bukan hanya berdasarkan data transaksi pengguna, tetapi juga berdasarkan **pengetahuan bisnis umum** yang relevan untuk UMKM.

---

## Arsitektur RAG dalam SPARK

```
User mengirim pertanyaan
        ↓
  Keyword Matching (retrieve relevant knowledge chunks)
        ↓
  Business Context Builder (data transaksi real pengguna)
        ↓
  Prompt Assembly:
    [System Prompt] + [Business Context] + [RAG Knowledge] + [Chat History] + [User Message]
        ↓
  Gemini LLM generates response
        ↓
  Response dikembalikan ke user
```

### Dua Sumber Konteks

| Sumber | Deskripsi | Contoh |
|--------|-----------|--------|
| **Business Context** | Data nyata dari database pengguna (produk, stok, transaksi, pengeluaran) | "Stok Gula tinggal 5 unit" |
| **RAG Knowledge Base** | Pengetahuan bisnis umum yang dikurasi (tips, strategi, best practices) | "Tips mengelola cash flow UMKM" |

**Aturan Emas:** Angka dan data bisnis HANYA boleh berasal dari Business Context. RAG Knowledge Base hanya menyediakan tips, strategi, dan pengetahuan umum.

---

## Knowledge Base — Struktur dan Kategori

### Lokasi File
```
backend/services/rag_knowledge.py
```

### Kategori Pengetahuan

| Kategori | Scope | Contoh Topik |
|----------|-------|--------------|
| `keuangan` | Cash flow, margin, profit, modal, utang | Tips cash flow, cara hitung BEP |
| `marketing` | Promosi, branding, digital marketing | Strategi diskon, social media marketing |
| `penjualan` | Sales, omzet, layanan pelanggan | Upselling, cross-selling, retensi pelanggan |
| `stok` | Inventory, supplier, reorder | FIFO, safety stock, negosiasi supplier |
| `bisnis` | Operasional, SDM, pengembangan, legalitas | SOP, scaling, perizinan UMKM |
| `umum` | Mindset, motivasi, tips pemula | Komunitas UMKM, belajar keuangan dasar |

### Format Knowledge Chunk

```python
@dataclass
class KnowledgeChunk:
    topic: str          # Judul topik
    keywords: list[str] # Kata kunci untuk retrieval
    content: str        # Isi pengetahuan (tips, panduan)
    category: str       # Kategori (keuangan, marketing, dll)
```

---

## Retrieval — Mekanisme Pencarian

### Metode: Keyword Scoring
SPARK menggunakan **keyword matching dengan scoring** sebagai mekanisme retrieval yang ringan dan cepat tanpa memerlukan vector database eksternal.

```python
def retrieve_relevant_knowledge(query: str, top_k: int = 3) -> list[KnowledgeChunk]:
    # 1. Exact keyword match → score +2.0
    # 2. Partial keyword match → score +0.5
    # 3. Topic title match → score +1.0
    # 4. Sort by score, return top_k
    # 5. Fallback: return general tips if no match
```

### Aturan Retrieval

1. **Top-K = 3**: Maksimal 3 knowledge chunk diinjeksi ke prompt untuk menjaga token budget.
2. **Fallback ke Umum**: Jika tidak ada keyword match, kembalikan tips dari kategori `umum`.
3. **Tidak pernah kosong**: Selalu ada minimal 1 chunk yang dikembalikan.

---

## Prompt Assembly — Cara Menggabungkan Konteks

### Template System Prompt

```python
CONSULTANT_SYSTEM_PROMPT = """
You are SPARK, a friendly and knowledgeable financial & business consultant...

## Business Context (Data Nyata Pengguna)
{business_context}

## Knowledge Base (Pengetahuan Bisnis Umum)
{rag_knowledge}
"""
```

### Urutan Prioritas dalam Prompt

1. **System instructions** — siapa SPARK, apa yang boleh/tidak boleh dilakukan
2. **Business Context** — data real pengguna (prioritas tertinggi untuk angka)
3. **RAG Knowledge** — tips dan strategi bisnis yang relevan
4. **Chat History** — riwayat percakapan untuk konteks
5. **User Message** — pertanyaan terbaru

---

## Scope Control — Batasan Domain LLM

### Domain yang BOLEH Dijawab

| Domain | Contoh Pertanyaan |
|--------|-------------------|
| Keuangan & Akuntansi | "Bagaimana cara menghitung margin?" |
| Marketing & Promosi | "Gimana caranya promosi di Instagram?" |
| Penjualan & Sales | "Produk saya sepi, gimana cara meningkatkan sales?" |
| Manajemen Stok | "Kapan waktu yang tepat untuk restock?" |
| Operasional Bisnis | "Bagaimana membuat SOP sederhana?" |
| Pengembangan Usaha | "Kapan sebaiknya buka cabang?" |
| Legalitas UMKM | "Apakah saya perlu izin PIRT?" |
| Motivasi & Mindset | "Bisnis saya gagal terus, gimana ya?" |

### Domain yang TIDAK BOLEH Dijawab (Out of Scope)

| Domain | Cara Menangani |
|--------|----------------|
| Politik & Agama | Arahkan kembali ke topik bisnis dengan sopan |
| Medis & Kesehatan | "Saya khusus membantu urusan bisnis ya" |
| Hukum Pidana | "Untuk masalah hukum, silakan konsultasi ke ahli hukum" |
| Konten Berbahaya | Tolak dengan sopan |
| Coding & Teknis IT | "Saya fokus membantu sisi bisnis dan keuangan kamu" |

### Implementasi di System Prompt

```
- Jika pertanyaan sangat di luar konteks bisnis/keuangan (misal: resep masakan, politik),
  arahkan kembali dengan sopan.
```

---

## Fallback Strategy

Ketika LLM tidak tersedia (API key kosong, timeout, rate limit), sistem menggunakan strategi fallback berlapis:

### Layer 1: Data-Based Fallback
Untuk pertanyaan tentang data bisnis (stok, keuntungan, pengeluaran), gunakan data dari `BusinessContext` secara langsung.

### Layer 2: RAG-Based Fallback
Untuk pertanyaan tentang tips/strategi bisnis, ambil knowledge chunk yang relevan dan tampilkan langsung tanpa LLM.

### Layer 3: Generic Fallback
Jika kedua layer di atas tidak cocok, tampilkan pesan umum yang mengajak user mencoba lagi.

```python
def _fallback_chat(message, business_context):
    # Layer 1: check if question is about user's data
    # Layer 2: retrieve RAG knowledge and display directly
    # Layer 3: generic helpful message
```

---

## Menambahkan Knowledge Baru

Untuk menambahkan topik baru ke knowledge base:

### 1. Edit File
```
backend/services/rag_knowledge.py
```

### 2. Tambahkan KnowledgeChunk Baru
```python
KnowledgeChunk(
    topic="Judul Topik Baru",
    keywords=["keyword1", "keyword2", "keyword3"],
    category="kategori",  # keuangan, marketing, penjualan, stok, bisnis, umum
    content="""
Tips tentang topik baru:
1. Poin pertama
2. Poin kedua
3. Poin ketiga
"""
),
```

### 3. Guidelines untuk Menulis Knowledge

- **Bahasa sederhana** — tulis seolah berbicara dengan pemilik warung.
- **Actionable** — setiap poin harus bisa langsung dipraktikkan.
- **Relevan untuk UMKM Indonesia** — jangan pakai referensi bisnis enterprise/korporat.
- **Singkat** — maksimal 7 poin per chunk.
- **Keywords yang lengkap** — sertakan sinonim dan variasi bahasa (misal: "stok" dan "stock").

---

## Migrasi ke Vector Search (Opsional — Masa Depan)

Jika knowledge base berkembang menjadi 50+ chunks, pertimbangkan migrasi ke vector search:

1. **Embedding Model**: Gunakan `text-embedding-004` dari Google.
2. **Vector Store**: PostgreSQL dengan ekstensi `pgvector` (sudah ada di stack).
3. **Hybrid Search**: Kombinasikan keyword matching (BM25) dengan semantic similarity.

Untuk saat ini, keyword scoring sudah cukup untuk 10-20 knowledge chunks.

---

## Checklist Verifikasi

- [ ] Pertanyaan tentang data bisnis dijawab menggunakan angka dari BusinessContext
- [ ] Pertanyaan tentang strategi/tips dijawab dengan bantuan RAG Knowledge
- [ ] Pertanyaan di luar scope bisnis diarahkan kembali dengan sopan
- [ ] Fallback berjalan ketika LLM tidak tersedia
- [ ] Knowledge Base mencakup minimal 6 kategori bisnis
- [ ] Angka finansial TIDAK PERNAH berasal dari RAG — hanya dari database
