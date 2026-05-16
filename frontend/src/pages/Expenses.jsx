import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, Wallet, Filter } from 'lucide-react';
import useExpenseStore from '../stores/expenseStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ExpenseFormModal from '../components/ui/ExpenseFormModal';
import Modal from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import './Expenses.css';

export default function Expenses() {
  const { expenses, loading, fetchExpenses, addExpense, editExpense, confirmExpenseItem, removeExpense } = useExpenseStore();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const openAdd = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingExpense) {
        await editExpense(editingExpense.id, data);
      } else {
        await addExpense(data);
      }
      setShowForm(false);
      setEditingExpense(null);
    } catch (e) {
      /* error handled by store */
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmExpenseItem(id);
    } catch (e) {
      /* error handled by store */
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeExpense(id);
      setConfirmDelete(null);
    } catch (e) {
      /* error handled by store */
    }
  };

  // Filter
  let filtered = [...expenses];
  if (filterCategory) filtered = filtered.filter((e) => e.category === filterCategory);
  if (filterSource) filtered = filtered.filter((e) => e.source === filterSource);

  // Summary
  const totalConfirmed = filtered
    .filter((e) => e.status === 'confirmed')
    .reduce((sum, e) => sum + (Number(e.total_actual) || 0), 0);
  const draftCount = filtered.filter((e) => e.status === 'draft').length;

  if (loading && expenses.length === 0) {
    return (
      <div className="expenses-page">
        <div style={{ padding: '64px', color: 'var(--text-muted)', textAlign: 'center', animation: 'pulse 2s infinite' }}>
          Memuat pengeluaran...
        </div>
      </div>
    );
  }

  return (
    <div className="expenses-page animate-fade-in">
      <div className="expenses-page__header">
        <h1>💸 Pengeluaran</h1>
        <div className="expenses-page__header-actions">
          <Badge variant="primary">{expenses.length} item</Badge>
          <Button variant="primary" size="sm" onClick={openAdd} id="btn-add-expense">
            <Plus size={16} style={{ marginRight: '6px' }} /> Tambah
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="expenses-page__summary stagger-children">
        <div className="expenses-page__summary-card">
          <span className="expenses-page__summary-label">Total Pengeluaran</span>
          <span className="expenses-page__summary-value" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(totalConfirmed)}
          </span>
        </div>
        <div className="expenses-page__summary-card">
          <span className="expenses-page__summary-label">Dikonfirmasi</span>
          <span className="expenses-page__summary-value">
            {filtered.filter((e) => e.status === 'confirmed').length}
          </span>
        </div>
        <div className="expenses-page__summary-card">
          <span className="expenses-page__summary-label">Menunggu Konfirmasi</span>
          <span className="expenses-page__summary-value" style={{ color: 'var(--color-warning)' }}>
            {draftCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="expenses-page__filters">
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          className="input"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          id="filter-category"
        >
          <option value="">Semua Kategori</option>
          <option value="Pembelian Stok">Pembelian Stok</option>
          <option value="Operasional">Operasional</option>
          <option value="Lainnya">Lainnya</option>
        </select>
        <select
          className="input"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          id="filter-source"
        >
          <option value="">Semua Sumber</option>
          <option value="auto-tambah-stok">Otomatis (Stok)</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada pengeluaran"
          text="Pengeluaran otomatis dibuat saat kamu menambah stok, atau tambahkan secara manual."
          icon={<Wallet size={40} />}
          action={<Button variant="primary" onClick={openAdd}><Plus size={16} style={{ marginRight: '6px' }} /> Tambah Pengeluaran</Button>}
        />
      ) : (
        <div className="expenses-page__list stagger-children">
          {filtered.map((exp) => (
            <div
              key={exp.id}
              className={`expense-row ${exp.status === 'draft' ? 'expense-row--draft' : ''}`}
              id={`expense-${exp.id}`}
              onClick={() => openEdit(exp)}
            >
              <div className="expense-row__info">
                <span className="expense-row__name">{exp.name}</span>
                <div className="expense-row__meta">
                  <Badge variant={exp.status === 'draft' ? 'danger' : 'success'} dot>
                    {exp.status === 'draft' ? 'Draft' : 'Dikonfirmasi'}
                  </Badge>
                  <Badge variant="info">{exp.category}</Badge>
                  <span>{formatDate(exp.expense_date)}</span>
                  {exp.source === 'auto-tambah-stok' && <Badge variant="primary">Auto</Badge>}
                </div>
              </div>
              <div className="expense-row__right">
                <span className="expense-row__amount">-{formatCurrency(exp.total_actual)}</span>
                <div className="expense-row__actions" onClick={(e) => e.stopPropagation()}>
                  {exp.status === 'draft' && (
                    <button
                      className="expense-row__action-btn expense-row__action-btn--confirm"
                      onClick={() => handleConfirm(exp.id)}
                      title="Konfirmasi"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="expense-row__action-btn expense-row__action-btn--edit"
                    onClick={() => openEdit(exp)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="expense-row__action-btn expense-row__action-btn--delete"
                    onClick={() => setConfirmDelete(exp)}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingExpense(null); }}
        expense={editingExpense}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="🗑️ Hapus Pengeluaran?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete?.id)}>Ya, Hapus</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          Yakin ingin menghapus <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
