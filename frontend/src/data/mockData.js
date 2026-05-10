// Realistic Indonesian warung demo data

export const MOCK_USER = {
  id: 'u-001',
  email: 'bu.ani@warung.id',
  businessName: 'Warung Bu Ani',
  createdAt: '2025-01-15',
};

export const MOCK_PRODUCTS = [
  { id: 'p-001', name: 'Indomie Goreng', category: 'Makanan', unit: 'pcs', basePrice: 2800, sellPrice: 3500, currentStock: 48, minStockThreshold: 20 },
  { id: 'p-002', name: 'Beras 5kg', category: 'Sembako', unit: 'karung', basePrice: 65000, sellPrice: 72000, currentStock: 3, minStockThreshold: 5 },
  { id: 'p-003', name: 'Minyak Goreng 1L', category: 'Sembako', unit: 'botol', basePrice: 18000, sellPrice: 21000, currentStock: 12, minStockThreshold: 8 },
  { id: 'p-004', name: 'Gula Pasir 1kg', category: 'Sembako', unit: 'kg', basePrice: 15000, sellPrice: 18000, currentStock: 7, minStockThreshold: 5 },
  { id: 'p-005', name: 'Kopi Kapal Api', category: 'Minuman', unit: 'sachet', basePrice: 1200, sellPrice: 2000, currentStock: 85, minStockThreshold: 30 },
  { id: 'p-006', name: 'Teh Pucuk 350ml', category: 'Minuman', unit: 'botol', basePrice: 3200, sellPrice: 4000, currentStock: 24, minStockThreshold: 12 },
  { id: 'p-007', name: 'Sabun Lifebuoy', category: 'Kebutuhan', unit: 'pcs', basePrice: 3500, sellPrice: 5000, currentStock: 15, minStockThreshold: 10 },
  { id: 'p-008', name: 'Rokok Surya 12', category: 'Rokok', unit: 'bungkus', basePrice: 18000, sellPrice: 21000, currentStock: 2, minStockThreshold: 10 },
  { id: 'p-009', name: 'Telur 1kg', category: 'Sembako', unit: 'kg', basePrice: 26000, sellPrice: 30000, currentStock: 0, minStockThreshold: 3 },
  { id: 'p-010', name: 'Aqua 600ml', category: 'Minuman', unit: 'botol', basePrice: 2500, sellPrice: 3500, currentStock: 36, minStockThreshold: 24 },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 't-001', type: 'sale', totalAmount: 52500, source: 'manual',
    date: '2026-05-10', notes: 'Penjualan pagi',
    items: [
      { productName: 'Indomie Goreng', quantity: 5, unitPrice: 3500, subtotal: 17500 },
      { productName: 'Kopi Kapal Api', quantity: 10, unitPrice: 2000, subtotal: 20000 },
      { productName: 'Aqua 600ml', quantity: 3, unitPrice: 3500, subtotal: 10500 },
      { productName: 'Sabun Lifebuoy', quantity: 1, unitPrice: 5000, subtotal: 5000 },
    ],
  },
  {
    id: 't-002', type: 'sale', totalAmount: 38000, source: 'ocr',
    date: '2026-05-10', notes: 'Scan nota siang',
    items: [
      { productName: 'Teh Pucuk 350ml', quantity: 4, unitPrice: 4000, subtotal: 16000 },
      { productName: 'Rokok Surya 12', quantity: 1, unitPrice: 21000, subtotal: 21000 },
      { productName: 'Gula Pasir 1kg', quantity: 0, unitPrice: 18000, subtotal: 0 },
    ],
  },
  {
    id: 't-003', type: 'purchase', totalAmount: 385000, source: 'manual',
    date: '2026-05-09', notes: 'Belanja stok dari distributor',
    items: [
      { productName: 'Indomie Goreng', quantity: 40, unitPrice: 2800, subtotal: 112000 },
      { productName: 'Beras 5kg', quantity: 3, unitPrice: 65000, subtotal: 195000 },
      { productName: 'Minyak Goreng 1L', quantity: 4, unitPrice: 18000, subtotal: 72000 },
      { productName: 'Kopi Kapal Api', quantity: 5, unitPrice: 1200, subtotal: 6000 },
    ],
  },
  {
    id: 't-004', type: 'sale', totalAmount: 93000, source: 'manual',
    date: '2026-05-09', notes: 'Penjualan seharian',
    items: [
      { productName: 'Beras 5kg', quantity: 1, unitPrice: 72000, subtotal: 72000 },
      { productName: 'Minyak Goreng 1L', quantity: 1, unitPrice: 21000, subtotal: 21000 },
    ],
  },
  {
    id: 't-005', type: 'sale', totalAmount: 67500, source: 'ocr',
    date: '2026-05-08', notes: '',
    items: [
      { productName: 'Telur 1kg', quantity: 1.5, unitPrice: 30000, subtotal: 45000 },
      { productName: 'Gula Pasir 1kg', quantity: 1, unitPrice: 18000, subtotal: 18000 },
      { productName: 'Aqua 600ml', quantity: 1, unitPrice: 3500, subtotal: 3500 },
    ],
  },
  {
    id: 't-006', type: 'purchase', totalAmount: 210000, source: 'manual',
    date: '2026-05-07', notes: 'Restock mingguan',
    items: [
      { productName: 'Rokok Surya 12', quantity: 10, unitPrice: 18000, subtotal: 180000 },
      { productName: 'Telur 1kg', quantity: 1, unitPrice: 26000, subtotal: 26000 },
      { productName: 'Kopi Kapal Api', quantity: 3, unitPrice: 1200, subtotal: 3600 },
    ],
  },
];

export const MOCK_INSIGHTS = [
  {
    id: 'i-001',
    triggerType: 'LOW_STOCK',
    triggerData: { productName: 'Rokok Surya 12', currentStock: 2, avgDailySales: 3 },
    text: 'Stok Rokok Surya 12 tinggal 2 bungkus. Rata-rata penjualan 3 bungkus per hari — kemungkinan habis besok. Segera restock!',
    isRead: false,
    createdAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 'i-002',
    triggerType: 'LOW_STOCK',
    triggerData: { productName: 'Telur 1kg', currentStock: 0, avgDailySales: 1.5 },
    text: 'Telur sudah habis! Kemarin ada 1-2 pembeli telur per hari. Pelanggan bisa kecewa kalau datang dan stok kosong.',
    isRead: false,
    createdAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 'i-003',
    triggerType: 'EXPENSE_SPIKE',
    triggerData: { thisWeek: 595000, lastWeek: 420000, percentChange: 41.7 },
    text: 'Pengeluaran minggu ini naik 41% dibanding minggu lalu (Rp595.000 vs Rp420.000). Cek apakah ada pembelian stok besar atau ada pengeluaran tidak biasa.',
    isRead: true,
    createdAt: '2026-05-09T18:00:00Z',
  },
  {
    id: 'i-004',
    triggerType: 'DEAD_STOCK',
    triggerData: { productName: 'Sabun Lifebuoy', daysSinceLastSale: 5 },
    text: 'Sabun Lifebuoy belum terjual 5 hari terakhir. Pertimbangkan promo kecil atau pindahkan ke display depan supaya pembeli lebih mudah lihat.',
    isRead: false,
    createdAt: '2026-05-10T08:00:00Z',
  },
];

export const MOCK_CHAT_SUGGESTIONS = [
  'Berapa keuntungan saya hari ini?',
  'Produk apa yang paling laris minggu ini?',
  'Stok mana yang perlu diisi ulang?',
  'Bagaimana tren penjualan 7 hari terakhir?',
];

export const MOCK_CHAT_RESPONSES = {
  'Berapa keuntungan saya hari ini?':
    'Hari ini total penjualan Rp90.500 dan belum ada pembelian stok. Keuntungan kotor hari ini sekitar Rp22.600. Lumayan untuk hari Sabtu! 💪',
  'Produk apa yang paling laris minggu ini?':
    'Minggu ini, Kopi Kapal Api paling banyak terjual (sekitar 25 sachet), diikuti Indomie Goreng (18 pcs) dan Aqua 600ml (10 botol). Tiga produk ini penyumbang pendapatan terbesar.',
  'Stok mana yang perlu diisi ulang?':
    'Ada 3 produk yang perlu segera diisi: (1) Telur — sudah habis, (2) Rokok Surya 12 — sisa 2 bungkus, dan (3) Beras 5kg — sisa 3 karung di bawah batas minimum 5.',
  'Bagaimana tren penjualan 7 hari terakhir?':
    'Penjualan 7 hari terakhir cukup stabil di kisaran Rp60.000–Rp95.000 per hari. Hari terbaik adalah Kamis (Rp93.000). Ada sedikit kenaikan dibanding minggu sebelumnya.',
};

export const MOCK_DAILY_SUMMARY = {
  todayRevenue: 90500,
  todayExpense: 0,
  todayProfit: 22600,
  weekRevenue: 638000,
  weekExpense: 595000,
  weekProfit: 43000,
};

// Simulated parsed receipt from OCR
export const MOCK_SCANNED_RECEIPT = {
  transactionDate: '2026-05-10',
  items: [
    { productName: 'Indomie Goreng', quantity: 3, unitPrice: 3500, subtotal: 10500 },
    { productName: 'Kopi Kapal Api', quantity: 5, unitPrice: 2000, subtotal: 10000 },
    { productName: 'Teh Pucuk 350ml', quantity: 2, unitPrice: 4000, subtotal: 8000 },
  ],
  totalAmount: 28500,
  confidence: 'high',
};
