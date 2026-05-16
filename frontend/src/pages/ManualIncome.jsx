import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import useBusinessStore from '../stores/businessStore';
import { createTransaction } from '../api/transactions';
import { formatCurrency } from '../utils/formatters';
import { getSimilarity } from '../utils/stringMath';
import './ManualIncome.css';

export default function ManualIncome() {
  const navigate = useNavigate();
  const { products, fetchProducts } = useBusinessStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const [manualTotal, setManualTotal] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        product_name: '',
        quantity: 1,
        unit_price: 0,
        is_from_stock: false,
        reduce_stock: false, // For old products
        is_new_product: false,
        add_new_stock: false, // For new products
        suggestion: null,
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, [field]: value };

        // If typing product name, run fuzzy matching
        if (field === 'product_name') {
          updatedItem.suggestion = null;
          updatedItem.is_new_product = false;
          updatedItem.is_from_stock = false;
          
          if (!value.trim()) return updatedItem;

          let bestMatch = null;
          let maxSim = 0;
          products.forEach(p => {
            const sim = getSimilarity(p.name, value);
            if (sim > maxSim) {
              maxSim = sim;
              bestMatch = p;
            }
          });

          if (maxSim === 1.0) {
            updatedItem.is_from_stock = true;
            updatedItem.unit_price = bestMatch.sell_price;
          } else if (maxSim >= 0.8) {
            updatedItem.is_new_product = true;
            updatedItem.suggestion = bestMatch;
          } else {
            updatedItem.is_new_product = true;
          }
        }

        return updatedItem;
      })
    );
  };

  const acceptSuggestion = (id, suggestedProduct) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        product_name: suggestedProduct.name,
        unit_price: suggestedProduct.sell_price,
        is_from_stock: true,
        is_new_product: false,
        suggestion: null
      };
    }));
  };

  const rejectSuggestion = (id) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        suggestion: null
      };
    }));
  };

  const calculateSubtotal = (item) => {
    return (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
  };

  const calculateTotal = () => {
    if (items.length > 0) {
      return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    }
    return Number(manualTotal) || 0;
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Nama / Keterangan transaksi wajib diisi');
      return;
    }

    // Validate QTY > 0
    for (let i = 0; i < items.length; i++) {
      const q = Number(items[i].quantity);
      if (!q || q <= 0) {
        setError(`Item ke-${i + 1} memiliki jumlah (Qty) yang tidak valid. Minimal 1.`);
        return;
      }
    }

    const total = calculateTotal();
    if (total <= 0) {
      if (!window.confirm('Total pendapatan adalah Rp 0. Apakah Anda yakin ingin menyimpan?')) {
        return;
      }
    }

    // Prepare items for API
    const formattedItems = items.map(item => ({
      product_name: item.product_name || 'Item Manual',
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      subtotal: calculateSubtotal(item),
      reduce_stock: item.is_from_stock ? item.reduce_stock : false,
      is_new_product: item.is_new_product,
      add_new_stock: item.is_new_product ? item.add_new_stock : false,
    }));

    const payload = {
      transaction_type: 'sale',
      source: 'manual',
      transaction_date: date,
      notes: notes + (time ? ` (Waktu: ${time})` : ''),
      total_amount: total,
      items: formattedItems.length > 0 ? formattedItems : [{
        product_name: description,
        quantity: 1,
        unit_price: total,
        subtotal: total,
        reduce_stock: false,
        is_new_product: false,
        add_new_stock: false,
      }],
    };

    setLoading(true);
    setError(null);

    try {
      await createTransaction(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal mencatat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="manual-income-page" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <CheckCircle size={64} color="var(--accent-green)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ marginBottom: '8px' }}>Pendapatan Berhasil Dicatat</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Total pendapatan: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(calculateTotal())}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
          <Button variant="primary" onClick={() => {
            setSuccess(false);
            setDescription('');
            setItems([]);
            setManualTotal('');
            setNotes('');
          }}>Tambah Lagi</Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="manual-income-page animate-fade-in">
      <div className="manual-income-header">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </Button>
        <h1>Tambah Pendapatan Manual</h1>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--accent-red)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="manual-income-card">
        <div className="manual-income-card-title">Informasi Dasar</div>
        <div className="grid-2-col">
          <Input 
            label="Tanggal Transaksi" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          <Input 
            label="Waktu" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
          />
        </div>
        <div style={{ marginTop: '16px' }}>
          <Input 
            label="Nama / Keterangan Transaksi" 
            placeholder="Contoh: Penjualan baju, Titip jual..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="manual-income-card">
        <div className="manual-income-card-title">
          <span>Daftar Item (Opsional)</span>
        </div>

        {items.map((item, index) => (
          <div key={item.id} className="item-row-container">
            <div className="item-row">
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="label-text">Nama Produk</label>
                  {item.is_new_product && !item.suggestion && (
                    <Badge variant="secondary" style={{ fontSize: '10px', padding: '2px 6px' }}>🆕 Produk Baru</Badge>
                  )}
                </div>
                <Input
                  placeholder="Nama produk..."
                  value={item.product_name}
                  onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                  list={`products-list-${item.id}`}
                />
                <datalist id={`products-list-${item.id}`}>
                  {products.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                {item.suggestion && (
                  <div className="suggestion-box animate-fade-in">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Maksud kamu: <strong>{item.suggestion.name}</strong>?</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <Button variant="secondary" size="sm" onClick={() => acceptSuggestion(item.id, item.suggestion)} style={{ padding: '4px 8px', fontSize: '12px' }}>Ya, gunakan ini</Button>
                      <Button variant="ghost" size="sm" onClick={() => rejectSuggestion(item.id)} style={{ padding: '4px 8px', fontSize: '12px' }}>Tidak, buat baru</Button>
                    </div>
                  </div>
                )}
                {item.is_new_product && !item.suggestion && item.product_name.trim() && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    Produk ini belum terdaftar, akan otomatis didaftarkan saat disimpan.
                  </span>
                )}
              </div>
              
              <div>
                <label className="label-text" style={{ marginBottom: '4px', display: 'block' }}>Qty</label>
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                />
              </div>

              <div>
                <label className="label-text" style={{ marginBottom: '4px', display: 'block' }}>Harga Satuan</label>
                <Input
                  type="number"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                />
              </div>

              <div className="item-row-remove">
                <Button variant="danger" size="sm" onClick={() => handleRemoveItem(item.id)} style={{ padding: '8px' }}>
                  <Trash2 size={18} />
                </Button>
              </div>

              {/* Toggles underneath */}
              <div className="item-row-options animate-fade-in">
                {item.is_from_stock && (
                  <label>
                    <input 
                      type="checkbox" 
                      checked={item.reduce_stock}
                      onChange={(e) => handleItemChange(item.id, 'reduce_stock', e.target.checked)}
                    />
                    Kurangi stok produk ini secara otomatis?
                  </label>
                )}
                {item.is_new_product && !item.suggestion && (
                  <label>
                    <input 
                      type="checkbox" 
                      checked={item.add_new_stock}
                      onChange={(e) => handleItemChange(item.id, 'add_new_stock', e.target.checked)}
                    />
                    Tambahkan {item.quantity || 0} unit ke stok produk ini?
                  </label>
                )}
              </div>

              <div className="subtotal-display">
                Subtotal: <strong>{formatCurrency(calculateSubtotal(item))}</strong>
              </div>
            </div>
          </div>
        ))}

        <Button variant="ghost" className="add-item-btn" onClick={handleAddItem}>
          <Plus size={18} /> Tambah Item
        </Button>
      </div>

      <div className="manual-income-card">
        <div className="manual-income-card-title">Rincian Pembayaran</div>
        
        {items.length === 0 ? (
          <Input 
            label="Total Pendapatan (Rp)" 
            type="number" 
            placeholder="Masukkan total pendapatan..." 
            value={manualTotal}
            onChange={(e) => setManualTotal(e.target.value)}
          />
        ) : (
          <div className="total-display">
            <span>Total Pendapatan</span>
            <strong>{formatCurrency(calculateTotal())}</strong>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <Input 
            label="Catatan Tambahan (Opsional)" 
            type="textarea"
            rows={3}
            placeholder="Tambahkan catatan khusus jika ada..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="bottom-bar">
        <Button variant="ghost" onClick={() => navigate(-1)}>Batal</Button>
        <Button variant="primary" onClick={handleSave} loading={loading}>Simpan Pendapatan</Button>
      </div>
    </div>
  );
}
