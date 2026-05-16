"""
RAG Knowledge Base — Business, Marketing, Sales, Finance for UMKM.

Implements a lightweight in-memory retrieval system that injects relevant
business knowledge into the LLM prompt based on the user's question.
No external vector DB required — uses keyword matching for speed and simplicity.
"""
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class KnowledgeChunk:
    """A single piece of business knowledge."""
    topic: str
    keywords: list[str]
    content: str
    category: str  # bisnis, marketing, penjualan, keuangan, stok, umum


# ── Knowledge Base ──────────────────────────────────────────────────
# Curated knowledge articles for Indonesian UMKM context

KNOWLEDGE_BASE: list[KnowledgeChunk] = [
    # ── KEUANGAN / CASH FLOW ───────────────────────────────────────
    KnowledgeChunk(
        topic="Mengelola Cash Flow UMKM",
        keywords=["cashflow", "cash flow", "arus kas", "uang masuk", "uang keluar", "likuiditas", "keuangan"],
        category="keuangan",
        content="""
Tips Mengelola Cash Flow UMKM:
1. Pisahkan rekening pribadi dan bisnis — ini aturan paling dasar.
2. Catat SEMUA transaksi, sekecil apapun. Kebocoran kecil bisa jadi besar.
3. Terapkan aturan 50/30/20: 50% untuk operasional, 30% untuk pengembangan, 20% untuk dana darurat.
4. Negosiasikan tempo pembayaran ke supplier agar lebih panjang.
5. Pantau rasio uang masuk vs keluar setiap minggu, bukan hanya akhir bulan.
6. Jika arus kas negatif 3 hari berturut-turut, segera evaluasi pengeluaran.
"""
    ),
    KnowledgeChunk(
        topic="Menghitung Margin dan Profit",
        keywords=["margin", "profit", "keuntungan", "laba", "untung", "rugi", "bep", "break even", "harga pokok"],
        category="keuangan",
        content="""
Panduan Margin dan Profit UMKM:
1. Gross Margin = (Harga Jual - Harga Pokok) / Harga Jual × 100%.
2. Target margin sehat untuk retail: 30-50%. Untuk F&B: 60-70%.
3. Break Even Point (BEP) = Total Biaya Tetap / (Harga Jual - Biaya Variabel per Unit).
4. Jangan hanya lihat omzet — bisnis dengan omzet besar tapi margin tipis tetap berisiko.
5. Review harga jual setiap 3 bulan, sesuaikan dengan kenaikan harga bahan baku.
6. Laba bersih minimal 10-15% dari omzet agar bisnis berkelanjutan.
"""
    ),
    KnowledgeChunk(
        topic="Mengelola Utang dan Modal Usaha",
        keywords=["utang", "pinjaman", "modal", "investasi", "kredit", "kur", "pendanaan"],
        category="keuangan",
        content="""
Panduan Modal dan Utang untuk UMKM:
1. Idealnya, rasio utang tidak lebih dari 30% dari total aset bisnis.
2. Gunakan utang hanya untuk hal yang menghasilkan uang (beli stok, alat produksi), bukan untuk gaya hidup.
3. KUR (Kredit Usaha Rakyat) adalah opsi pinjaman dengan bunga rendah untuk UMKM.
4. Sebelum ambil pinjaman, pastikan proyeksi cash flow bisa menutup cicilan.
5. Simpan dana darurat bisnis minimal 3 bulan biaya operasional.
"""
    ),

    # ── MARKETING & PROMOSI ────────────────────────────────────────
    KnowledgeChunk(
        topic="Strategi Marketing untuk UMKM",
        keywords=["marketing", "pemasaran", "promosi", "iklan", "branding", "brand", "awareness"],
        category="marketing",
        content="""
Strategi Marketing UMKM yang Efektif:
1. Kenali target pasar — siapa pelanggan idealmu? Usia, kebiasaan, lokasi.
2. Manfaatkan media sosial gratis: Instagram, TikTok, WhatsApp Business.
3. Konten yang menjual: foto produk bagus + cerita di balik produk (storytelling).
4. Gunakan testimoni pelanggan sebagai social proof.
5. Kolaborasi dengan UMKM lain untuk saling promosi (cross-promotion).
6. Buat program referral: pelanggan yang mengajak teman dapat diskon.
7. Konsistensi posting lebih penting dari kuantitas — minimal 3x seminggu.
"""
    ),
    KnowledgeChunk(
        topic="Strategi Diskon dan Promosi",
        keywords=["diskon", "promo", "potongan harga", "sale", "bundling", "voucher", "kupon", "cashback"],
        category="marketing",
        content="""
Tips Memberikan Diskon yang Menguntungkan:
1. Jangan asal diskon — hitung dulu apakah margin masih positif setelah potongan.
2. Bundling: gabungkan produk laris dengan produk yang kurang laku.
3. Flash sale durasi pendek (2-4 jam) menciptakan urgensi pembelian.
4. Diskon untuk pembelian dalam jumlah banyak mendorong volume penjualan.
5. Gunakan diskon untuk menghabiskan stok lama (dead stock), bukan produk baru.
6. Program loyalitas (beli 10 gratis 1) lebih baik daripada diskon terus-menerus.
7. Pantau: jika setelah promo penjualan tidak naik signifikan, evaluasi strateginya.
"""
    ),
    KnowledgeChunk(
        topic="Digital Marketing dan Online Presence",
        keywords=["online", "digital", "sosial media", "instagram", "tiktok", "shopee", "tokopedia",
                  "marketplace", "website", "google", "seo", "ecommerce"],
        category="marketing",
        content="""
Strategi Digital untuk UMKM:
1. Marketplace (Shopee, Tokopedia) cocok untuk mulai jualan online tanpa modal besar.
2. Google My Business (gratis) — buat bisnis muncul di pencarian dan Google Maps.
3. WhatsApp Business: gunakan katalog produk, auto-reply, dan label pelanggan.
4. Konten video pendek (Reels, TikTok) saat ini punya jangkauan organik terbesar.
5. Investasi di foto produk berkualitas — ini "etalase" digital kamu.
6. Respon cepat ke pelanggan online meningkatkan konversi hingga 40%.
"""
    ),

    # ── PENJUALAN / SALES ──────────────────────────────────────────
    KnowledgeChunk(
        topic="Meningkatkan Penjualan",
        keywords=["penjualan", "jual", "omzet", "revenue", "sales", "closing", "pelanggan", "customer",
                  "konversi", "naik", "turun", "sepi"],
        category="penjualan",
        content="""
Strategi Meningkatkan Penjualan:
1. Upselling: tawarkan versi premium atau ukuran lebih besar.
2. Cross-selling: "Beli kopi, mau tambah roti?" — produk pelengkap.
3. Analisis jam/hari paling ramai lalu fokuskan stok dan tenaga di situ.
4. Follow-up pelanggan lama lewat WhatsApp — mereka lebih mudah membeli lagi.
5. Pasang produk terlaris di depan toko atau di bagian atas katalog online.
6. Buat paket hemat yang memberikan persepsi value lebih besar.
7. Jika penjualan menurun, jangan langsung potong harga — coba ubah cara promosi dulu.
"""
    ),
    KnowledgeChunk(
        topic="Memahami dan Melayani Pelanggan",
        keywords=["pelanggan", "customer", "layanan", "service", "komplain", "loyalitas", "retensi",
                  "kepuasan", "repeat order"],
        category="penjualan",
        content="""
Panduan Layanan Pelanggan UMKM:
1. Pelanggan lama 5x lebih murah dibanding cari pelanggan baru — jaga mereka!
2. Respon cepat dan ramah, bahkan saat dikomplain, itu kunci loyalitas.
3. Catat preferensi pelanggan tetap (misal: "Bu Sari selalu beli gula 2kg").
4. Minta feedback setelah pembelian — ini gratis dan sangat berharga.
5. Program membership sederhana (diskon khusus pelanggan tetap) meningkatkan repeat order.
6. Tangani komplain dengan formula: Dengarkan → Minta Maaf → Berikan Solusi → Follow Up.
"""
    ),

    # ── MANAJEMEN STOK ─────────────────────────────────────────────
    KnowledgeChunk(
        topic="Manajemen Stok dan Inventory",
        keywords=["stok", "stock", "inventaris", "inventory", "restock", "reorder", "gudang",
                  "kehabisan", "overstock", "dead stock", "expired"],
        category="stok",
        content="""
Tips Manajemen Stok untuk UMKM:
1. Gunakan metode FIFO (First In First Out) — jual barang lama dulu.
2. Tentukan minimum stok (safety stock) untuk setiap produk.
3. Reorder point = (Rata-rata penjualan harian × Lead time) + Safety stock.
4. Dead stock (tidak terjual 7+ hari) harus segera dipromosikan atau di-bundling.
5. Hindari overstock — modal tertahan di gudang itu merugikan cash flow.
6. Lakukan stock opname minimal 1x seminggu untuk produk fast-moving.
7. Catat tanggal kadaluarsa untuk produk yang bisa expired.
"""
    ),
    KnowledgeChunk(
        topic="Supplier dan Procurement",
        keywords=["supplier", "pemasok", "beli", "kulak", "grosir", "distributor", "harga beli",
                  "negosiasi", "pembelian"],
        category="stok",
        content="""
Tips Mengelola Supplier:
1. Punya minimal 2-3 supplier untuk produk kunci — jangan bergantung pada satu.
2. Negosiasi harga saat beli dalam jumlah besar (quantity discount).
3. Bandingkan harga supplier secara berkala — loyalitas itu bagus, tapi jangan rugi.
4. Bangun hubungan baik dengan supplier — saat darurat, kamu bisa minta bantuan.
5. Minta tempo pembayaran (misal: bayar 7-14 hari setelah barang diterima).
6. Catat semua pembelian agar bisa menganalisis tren harga bahan baku.
"""
    ),

    # ── OPERASIONAL & SDM ──────────────────────────────────────────
    KnowledgeChunk(
        topic="Mengelola Operasional Bisnis Kecil",
        keywords=["operasional", "karyawan", "pegawai", "sdm", "gaji", "efisiensi", "sop",
                  "prosedur", "manajemen waktu", "produktivitas"],
        category="bisnis",
        content="""
Tips Operasional untuk UMKM:
1. Buat SOP sederhana — tulis langkah-langkah kerja agar karyawan baru bisa langsung ikut.
2. Delegasikan tugas rutin agar pemilik bisa fokus pada strategi dan pengembangan.
3. Gunakan aplikasi pencatatan (seperti SPARK!) untuk mengurangi kesalahan manual.
4. Evaluasi efisiensi operasional setiap bulan — di mana waktu paling banyak terbuang?
5. Jangan rekrut karyawan terlalu cepat — pastikan beban kerja memang sudah overload.
6. Upah karyawan yang adil menghasilkan loyalitas dan produktivitas yang lebih tinggi.
"""
    ),

    # ── PENGEMBANGAN BISNIS ────────────────────────────────────────
    KnowledgeChunk(
        topic="Scaling dan Pengembangan Usaha",
        keywords=["kembang", "berkembang", "scale", "ekspansi", "cabang", "franchise", "pertumbuhan",
                  "rencana bisnis", "target", "visi", "strategi"],
        category="bisnis",
        content="""
Panduan Pengembangan UMKM:
1. Sebelum ekspansi, pastikan bisnis saat ini sudah stabil dan menguntungkan.
2. Dokumentasikan semua proses — ini syarat utama jika ingin buka cabang atau franchise.
3. Mulai dari satu channel baru (misal: dari offline ke online), jangan semuanya sekaligus.
4. Investasi pada sistem (pencatatan, stok, keuangan) sebelum menambah produk atau lokasi.
5. Target pertumbuhan yang realistis: 10-20% per tahun sudah sangat baik untuk UMKM.
6. Pelajari kompetitor — apa yang mereka lakukan dengan baik? Apa yang bisa kamu lakukan lebih baik?
"""
    ),
    KnowledgeChunk(
        topic="Legalitas dan Perizinan UMKM",
        keywords=["izin", "legal", "legalitas", "nib", "siup", "npwp", "pajak", "oss", "umkm",
                  "sertifikat", "halal", "bpom", "pirt"],
        category="bisnis",
        content="""
Panduan Legalitas Usaha:
1. NIB (Nomor Induk Berusaha) bisa diurus gratis lewat OSS (Online Single Submission).
2. NPWP usaha wajib untuk transaksi dengan perusahaan besar atau ikut tender.
3. Untuk produk makanan rumahan: urus izin PIRT di Dinas Kesehatan setempat.
4. Sertifikasi Halal sekarang gratis untuk UMKM lewat program pemerintah.
5. BPOM diperlukan jika produk didistribusikan secara nasional.
6. Legalitas meningkatkan kepercayaan pelanggan dan membuka akses ke pasar yang lebih besar.
"""
    ),

    # ── TIPS UMUM ──────────────────────────────────────────────────
    KnowledgeChunk(
        topic="Mindset Pengusaha UMKM",
        keywords=["motivasi", "semangat", "gagal", "bangkrut", "belajar", "mentor", "komunitas",
                  "tips", "saran", "nasihat", "pemula", "mulai usaha"],
        category="umum",
        content="""
Mindset Penting untuk Pengusaha UMKM:
1. Gagal itu biasa — yang penting belajar dari setiap kegagalan.
2. Catat dan ukur semuanya — "what gets measured, gets managed."
3. Jangan bandingkan bisnismu dengan bisnis orang lain yang sudah 10 tahun berjalan.
4. Bergabung dengan komunitas UMKM lokal untuk saling belajar dan networking.
5. Investasikan waktu untuk belajar keuangan dasar — ini skill paling penting.
6. Mulai dari yang kecil, eksekusi yang konsisten, besarkan yang berhasil.
"""
    ),
]


# ── Retrieval Functions ─────────────────────────────────────────────

def retrieve_relevant_knowledge(query: str, top_k: int = 3) -> list[KnowledgeChunk]:
    """
    Retrieve the most relevant knowledge chunks for a given query.
    Uses keyword matching with scoring — lightweight alternative to vector search.
    """
    query_lower = query.lower()
    scored: list[tuple[float, KnowledgeChunk]] = []

    for chunk in KNOWLEDGE_BASE:
        score = 0.0
        # Exact keyword matches
        for kw in chunk.keywords:
            if kw in query_lower:
                score += 2.0  # strong match
            # Partial match (e.g., "market" matches "marketing")
            elif any(kw_part in query_lower for kw_part in kw.split()):
                score += 0.5

        # Topic title partial match
        if any(word in query_lower for word in chunk.topic.lower().split()):
            score += 1.0

        if score > 0:
            scored.append((score, chunk))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    results = [chunk for _, chunk in scored[:top_k]]

    if not results:
        # If no keyword match, return general tips
        general = [c for c in KNOWLEDGE_BASE if c.category == "umum"]
        results = general[:1]

    logger.debug("RAG retrieved %d chunks for query: %s", len(results), query[:50])
    return results


def format_rag_context(chunks: list[KnowledgeChunk]) -> str:
    """Format retrieved knowledge chunks into a string for prompt injection."""
    if not chunks:
        return ""

    sections = []
    for chunk in chunks:
        sections.append(f"📘 {chunk.topic}\n{chunk.content.strip()}")

    return "\n\n---\n\n".join(sections)


def get_rag_knowledge_for_query(query: str, top_k: int = 3) -> str:
    """One-liner: retrieve and format relevant knowledge for a query."""
    chunks = retrieve_relevant_knowledge(query, top_k=top_k)
    return format_rag_context(chunks)
