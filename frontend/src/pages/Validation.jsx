import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ValidationForm from '../components/receipt/ValidationForm';
import Button from '../components/ui/Button';
import useTransactionStore from '../stores/transactionStore';
import EmptyState from '../components/ui/EmptyState';
import './Validation.css';

export default function Validation() {
  const navigate = useNavigate();
  const { pendingReceipt, confirmTransaction, clearPendingReceipt } = useTransactionStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (saved) {
    return (
      <div className="validation-page">
        <div className="validation-page__success">
          <div className="validation-page__success-icon"><CheckCircle size={36} /></div>
          <h2>Berhasil Disimpan! 🎉</h2>
          <p>Transaksi sudah tercatat. Kamu bisa lihat di dashboard.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Ke Dashboard</Button>
          <Button variant="ghost" onClick={() => { setSaved(false); navigate('/scan'); }}>Scan Lagi</Button>
        </div>
      </div>
    );
  }

  if (!pendingReceipt) {
    return (
      <div className="validation-page">
        <EmptyState
          title="Belum ada nota yang di-scan"
          text="Scan nota dulu, baru bisa review hasilnya di sini."
          action={<Button variant="primary" onClick={() => navigate('/scan')}>Scan Nota</Button>}
        />
      </div>
    );
  }

  // Map API snake_case fields to what ValidationForm expects (camelCase)
  const mappedReceipt = {
    ...pendingReceipt,
    transactionDate: pendingReceipt.transaction_date || pendingReceipt.transactionDate || '',
    totalAmount: pendingReceipt.total_amount || pendingReceipt.totalAmount || 0,
    items: (pendingReceipt.items || []).map((item) => ({
      productName: item.product_name || item.productName || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || item.unitPrice || 0,
      subtotal: item.subtotal || 0,
    })),
  };

  const handleConfirm = async (data) => {
    setSaving(true);
    setError(null);
    try {
      // Map back to API snake_case format
      const today = new Date().toISOString().split('T')[0];
      await confirmTransaction({
        transaction_type: data.type || 'sale',
        transaction_date: data.transactionDate || today,
        source: 'ocr',
        notes: 'Dari scan nota',
        items: data.items.map((item) => ({
          product_name: item.productName || 'Item Tidak Bernama',
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unitPrice) || 0,
          subtotal: Number(item.subtotal) || (Number(item.quantity || 1) * Number(item.unitPrice || 0)),
        })),
      });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="validation-page">
      <div className="validation-page__header animate-fade-in">
        <h1>✅ Review Hasil Scan</h1>
        <p>Periksa dan edit data di bawah sebelum menyimpan</p>
      </div>
      {error && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          color: 'var(--accent-red)',
          fontSize: 'var(--font-sm)',
          marginBottom: 'var(--space-md)',
        }}>
          {error}
        </div>
      )}
      <ValidationForm receipt={mappedReceipt} onConfirm={handleConfirm} onCancel={() => navigate('/scan')} />
    </div>
  );
}
