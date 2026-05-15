import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import './ValidationForm.css';

export default function ValidationForm({ receipt, onConfirm, onCancel }) {
  const [items, setItems] = useState(receipt?.items || []);
  const [date, setDate] = useState(receipt?.transactionDate || '');

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : Number(updated[idx].quantity);
        const p = field === 'unitPrice' ? Number(value) : Number(updated[idx].unitPrice);
        updated[idx].subtotal = q * p;
      }
      return updated;
    });
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const addItem = () => {
    setItems((prev) => [...prev, { productName: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const calcTotal = items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
  const hasMismatch = receipt?.totalAmount && Math.abs(calcTotal - receipt.totalAmount) > 1;

  const handleConfirm = () => {
    onConfirm?.({
      transactionDate: date,
      items,
      totalAmount: calcTotal,
      type: 'sale',
      source: 'ocr',
    });
  };

  return (
    <div className="validation-form animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input label="Tanggal Transaksi" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {receipt?.confidence && (
          <div className={`validation-form__confidence validation-form__confidence--${receipt.confidence}`}>
            {receipt.confidence === 'high' ? '✓ Data Akurat' : receipt.confidence === 'medium' ? '~ Cek Kembali' : '! Perlu Revisi'}
          </div>
        )}
      </div>

      <div className="validation-form__items">
        {items.map((item, idx) => (
          <div key={idx} className="validation-form__item">
            <div className="validation-form__item-header">
              <span className="validation-form__item-number">Item #{idx + 1}</span>
              <button className="validation-form__item-remove" onClick={() => removeItem(idx)} aria-label="Hapus item">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="validation-form__item-fields">
              <Input label="Nama Produk" value={item.productName} onChange={(e) => updateItem(idx, 'productName', e.target.value)} placeholder="Nama barang" />
              <Input label="Jumlah" type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} min="0" step="0.1" />
              <Input label="Harga Satuan" type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} min="0" />
              <Input label="Subtotal" type="number" value={item.subtotal} readOnly style={{ background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }} />
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={addItem} fullWidth style={{ border: '1px dashed var(--bg-border)' }}>+ Tambah Item</Button>

      <div className={`validation-form__total ${hasMismatch ? 'validation-form__total--mismatch' : ''}`}>
        <div>
          <div className="validation-form__total-label">Total Pembayaran</div>
          {hasMismatch && (
            <div className="validation-form__mismatch-warning">
              <AlertTriangle size={14} /> Beda dengan nota asli ({formatCurrency(receipt.totalAmount)})
            </div>
          )}
        </div>
        <span className="validation-form__total-value">{formatCurrency(calcTotal)}</span>
      </div>

      <div className="validation-form__actions">
        <Button variant="primary" fullWidth onClick={handleConfirm} id="btn-confirm-receipt">
          <Save size={18} style={{ marginRight: '8px' }} /> Simpan Transaksi
        </Button>
        <Button variant="ghost" fullWidth onClick={onCancel}>Batal</Button>
      </div>
    </div>
  );
}
