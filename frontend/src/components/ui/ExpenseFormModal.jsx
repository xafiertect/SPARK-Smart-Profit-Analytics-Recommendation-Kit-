import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { formatCurrency } from '../../utils/formatters';

const CATEGORIES = ['Pembelian Stok', 'Operasional', 'Lainnya'];

export default function ExpenseFormModal({ isOpen, onClose, expense, onSave, saving }) {
  const isEdit = !!expense;
  const isAuto = expense?.source === 'auto-tambah-stok';

  const [form, setForm] = useState({
    name: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Lainnya',
    total_actual: '',
    notes: '',
  });
  const [showConfirm, setShowConfirm] = useState(null); // null | 'diff' | 'zero'

  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.name || '',
        expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
        category: expense.category || 'Lainnya',
        total_actual: String(expense.total_actual ?? ''),
        notes: expense.notes || '',
      });
    } else {
      setForm({
        name: '',
        expense_date: new Date().toISOString().split('T')[0],
        category: 'Lainnya',
        total_actual: '',
        notes: '',
      });
    }
    setShowConfirm(null);
  }, [expense, isOpen]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const totalActual = Number(form.total_actual) || 0;
  const totalDefault = expense?.total_default ? Number(expense.total_default) : null;
  const difference = totalDefault != null ? totalActual - totalDefault : null;
  const diffPercent = totalDefault && totalDefault > 0 ? Math.abs(((totalActual - totalDefault) / totalDefault) * 100) : 0;

  const handleSubmit = () => {
    // RULE E-5: confirm if diff > 20%
    if (totalDefault != null && totalDefault > 0 && diffPercent > 20 && !showConfirm) {
      setShowConfirm('diff');
      return;
    }
    // RULE E-5: confirm if total = 0 but default > 0
    if (totalActual === 0 && totalDefault && totalDefault > 0 && !showConfirm) {
      setShowConfirm('zero');
      return;
    }

    onSave({
      name: form.name,
      expense_date: form.expense_date,
      category: form.category,
      total_actual: totalActual,
      notes: form.notes || null,
      source: isAuto ? 'auto-tambah-stok' : 'manual',
    });
    setShowConfirm(null);
  };

  const handleForceSubmit = () => {
    onSave({
      name: form.name,
      expense_date: form.expense_date,
      category: form.category,
      total_actual: totalActual,
      notes: form.notes || null,
      source: isAuto ? 'auto-tambah-stok' : 'manual',
    });
    setShowConfirm(null);
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem',
    }} onClick={onClose}>
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto', padding: '24px 28px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--bg-border)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
            {isEdit ? '✏️ Edit Pengeluaran' : '➕ Tambah Pengeluaran'}
          </h2>
          <button onClick={onClose} aria-label="Tutup" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface-2)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X size={18} />
          </button>
        </div>

        {/* Confirmation Banner (RULE E-5) */}
        {showConfirm === 'diff' && (
          <div style={{
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px',
            color: 'var(--color-warning)', fontSize: '0.875rem', lineHeight: 1.5,
          }}>
            <strong>Total berbeda dari perhitungan default</strong><br />
            Default: {formatCurrency(totalDefault)} — Kamu masukkan: {formatCurrency(totalActual)}<br />
            Apakah kamu yakin?
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <Button variant="primary" size="sm" onClick={handleForceSubmit}>Ya, Simpan</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(null)}>Ubah Lagi</Button>
            </div>
          </div>
        )}
        {showConfirm === 'zero' && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px',
            color: 'var(--color-danger)', fontSize: '0.875rem', lineHeight: 1.5,
          }}>
            <strong>Total pengeluaran adalah Rp 0.</strong> Apakah ini benar?
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <Button variant="primary" size="sm" onClick={handleForceSubmit}>Ya, Rp 0</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(null)}>Isi Total</Button>
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Nama Pengeluaran"
            placeholder="contoh: Biaya listrik toko"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            id="expense-name"
          />

          <div className="expense-form-row">
            <div>
              <Input
                label="Tanggal"
                type="date"
                value={form.expense_date}
                onChange={(e) => setField('expense_date', e.target.value)}
                id="expense-date"
              />
            </div>
            <div>
              <Input label="Kategori" type="select" value={form.category} onChange={(e) => setField('category', e.target.value)} id="expense-category">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Input>
            </div>
          </div>

          {/* Auto-stock info (readonly) */}
          {isAuto && (
            <div style={{
              background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
              padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Info Pembelian Stok
              </span>
              {expense.related_product_name && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Produk</span>
                  <span style={{ fontWeight: 600 }}>{expense.related_product_name}</span>
                </div>
              )}
              {expense.stock_quantity != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Jumlah Stok</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{expense.stock_quantity}</span>
                </div>
              )}
              {expense.unit_price_snapshot != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Harga Beli/Unit</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(expense.unit_price_snapshot)}</span>
                </div>
              )}
              {totalDefault != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderTop: '1px solid var(--bg-border)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Default</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalDefault)}</span>
                </div>
              )}
            </div>
          )}

          {/* Total Actual — always editable (RULE E-2) */}
          <div style={{ position: 'relative' }}>
            <Input
              label="Total Aktual (Rp)"
              type="number"
              placeholder="50000"
              value={form.total_actual}
              onChange={(e) => setField('total_actual', e.target.value)}
              id="expense-total-actual"
              hint={isAuto ? 'Bisa diubah bebas jika berbeda dari default' : null}
            />
          </div>

          {/* Difference display */}
          {difference != null && difference !== 0 && (
            <div style={{
              fontSize: '0.8125rem', padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: difference > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
              color: difference > 0 ? 'var(--color-danger)' : 'var(--color-success)',
              fontFamily: 'var(--font-mono)', fontWeight: 600,
            }}>
              Selisih: {difference > 0 ? '+' : ''}{formatCurrency(difference)}
              {diffPercent > 0 && ` (${diffPercent.toFixed(0)}%)`}
            </div>
          )}

          <Input
            label="Catatan (Opsional)"
            type="textarea"
            placeholder="Alasan perbedaan, diskon supplier, dll."
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            id="expense-notes"
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--bg-border)' }}>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={saving || !form.name.trim() || showConfirm}
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
