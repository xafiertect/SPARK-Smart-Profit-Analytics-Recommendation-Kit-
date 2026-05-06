import { useState, useEffect } from 'react';
import { Save, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ValidationTable({ initialData, onReset }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setItems(initialData.items || []);
      setTotal(initialData.total_nota || 0);
    }
  }, [initialData]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    // Update value
    item[field] = field === 'nama' ? value : Number(value);

    // Recalculate subtotal if qty or harga changes
    if (field === 'qty' || field === 'harga') {
      item.subtotal = item.qty * item.harga;
    }

    newItems[index] = item;
    setItems(newItems);

    // Recalculate total nota
    const newTotal = newItems.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
    setTotal(newTotal);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await axios.post('http://localhost:8000/api/v1/transactions/', {
        items,
        total_nota: total
      });
      alert("Transaksi berhasil disimpan dan stok telah diperbarui!");
      onReset();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan transaksi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel validation-container">
      <h2>Validasi Hasil Ekstraksi</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Periksa kembali hasil pembacaan AI. Anda dapat mengedit nama barang, jumlah, atau harga jika terdapat kesalahan.
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Harga Satuan (Rp)</th>
              <th className="text-right">Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input 
                    type="text" 
                    value={item.nama} 
                    onChange={(e) => handleItemChange(idx, 'nama', e.target.value)} 
                  />
                </td>
                <td className="text-right">
                  <input 
                    type="number" 
                    className="input-sm text-right"
                    value={item.qty} 
                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} 
                  />
                </td>
                <td className="text-right">
                  <input 
                    type="number" 
                    className="text-right"
                    value={item.harga} 
                    onChange={(e) => handleItemChange(idx, 'harga', e.target.value)} 
                  />
                </td>
                <td className="text-right">
                  {item.subtotal.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3" className="text-right">Total Nota</td>
              <td className="text-right">Rp {total.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>}

      <div className="action-bar">
        <button className="btn btn-secondary" onClick={onReset} disabled={isSaving}>
          <RefreshCw size={18} /> Batalkan
        </button>
        <button className="btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="spinner" size={18} /> : <Save size={18} />} Konfirmasi & Simpan
        </button>
      </div>
    </div>
  );
}
