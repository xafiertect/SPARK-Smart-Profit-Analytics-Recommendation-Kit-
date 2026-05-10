import { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
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
    <div className="validation-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input label="Tanggal Transaksi" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {receipt?.confidence && (
          <Badge variant={receipt.confidence === 'high' ? 'sale' : receipt.confidence === 'medium' ? 'warning' : 'purchase'}>
            {receipt.confidence === 'high' ? '✓ Yakin' : receipt.confidence === 'medium' ? '~ Cukup yakin' : '? Kurang yakin'}
          </Badge>
        )}
      </div>

      <div className="validation-form__items">
        {items.map((item, idx) => (
          <div key={idx} className="validation-form__item">
            <div className="validation-form__item-header">
              <span className="validation-form__item-number">Item #{idx + 1}</span>
              <button className="validation-form__item-remove" onClick={() => removeItem(idx)} aria-label="Hapus item">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="validation-form__item-fields">
              <Input label="Nama Produk" value={item.productName} onChange={(e) => updateItem(idx, 'productName', e.target.value)} placeholder="Nama barang" />
              <Input label="Jumlah" type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} min="0" step="0.1" />
              <Input label="Harga Satuan" type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} min="0" />
              <Input label="Subtotal" type="number" value={item.subtotal} readOnly />
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={addItem} fullWidth>+ Tambah Item</Button>

      <div className={`validation-form__total ${hasMismatch ? 'validation-form__total--mismatch' : ''}`}>
        <div>
          <span className="validation-form__total-label">Total</span>
          {hasMismatch && (
            <div className="validation-form__mismatch-warning">
              <AlertTriangle size={12} /> Total tidak cocok dengan nota ({formatCurrency(receipt.totalAmount)})
            </div>
          )}
        </div>
        <span className="validation-form__total-value">{formatCurrency(calcTotal)}</span>
      </div>

      <div className="validation-form__actions">
        <Button variant="success" fullWidth onClick={handleConfirm} id="btn-confirm-receipt">
          <CheckCircle size={18} /> Konfirmasi & Simpan
        </Button>
        <Button variant="secondary" fullWidth onClick={onCancel}>Batal</Button>
      </div>
    </div>
  );
}
