import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import useBusinessStore from '../stores/businessStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';
import './Products.css';

const CATEGORIES = ['Sembako', 'Makanan', 'Minuman', 'Rokok', 'Kebutuhan', 'Lainnya'];
const EMPTY_FORM = { name: '', category: 'Sembako', unit: 'pcs', base_price: '', sell_price: '', current_stock: '', min_stock_threshold: '5' };

export default function Products() {
  const { products, fetchProducts, addProduct, updateProduct, removeProduct, productsLoading } = useBusinessStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category || 'Sembako',
      unit: product.unit || 'pcs',
      base_price: String(product.base_price),
      sell_price: String(product.sell_price),
      current_stock: String(product.current_stock),
      min_stock_threshold: String(product.min_stock_threshold),
    });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nama produk wajib diisi'); return; }
    if (!form.sell_price || Number(form.sell_price) <= 0) { setError('Harga jual wajib diisi'); return; }
    if (!form.base_price || Number(form.base_price) <= 0) { setError('Harga beli wajib diisi'); return; }

    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit || 'pcs',
      base_price: Number(form.base_price),
      sell_price: Number(form.sell_price),
      current_stock: Number(form.current_stock) || 0,
      min_stock_threshold: Number(form.min_stock_threshold) || 5,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setShowModal(false);
    } catch (e) {
      setError(e.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeProduct(id);
      setConfirmDelete(null);
    } catch (e) {
      setError(e.message || 'Gagal menghapus produk');
    }
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const getStockClass = (p) => {
    if (p.current_stock <= 0) return 'zero';
    if (p.current_stock <= p.min_stock_threshold) return 'low';
    return 'ok';
  };

  if (productsLoading && products.length === 0) {
    return (
      <div className="products-page">
        <div style={{ padding: '64px', color: 'var(--text-muted)', textAlign: 'center', animation: 'pulse 2s infinite' }}>
          Memuat produk...
        </div>
      </div>
    );
  }

  return (
    <div className="products-page animate-fade-in">
      <div className="products-page__header">
        <h1>📦 Produk</h1>
        <div className="products-page__header-actions">
          <Badge variant="primary">{products.length} item</Badge>
          <Button variant="primary" size="sm" onClick={openAdd} id="btn-add-product">
            <Plus size={16} style={{ marginRight: '6px' }} /> Tambah
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          text="Tambahkan produk pertamamu untuk mulai mencatat transaksi dengan cepat."
          icon={<Package size={40} />}
          action={<Button variant="primary" onClick={openAdd}><Plus size={16} style={{ marginRight: '6px' }} /> Tambah Produk</Button>}
        />
      ) : (
        <div className="products-page__grid stagger-children">
          {products.map((p) => (
            <div key={p.id} className="product-row" id={`product-${p.id}`}>
              <div className="product-row__info">
                <span className="product-row__name">{p.name}</span>
                <div className="product-row__meta">
                  <Badge variant="info">{p.category || '-'}</Badge>
                  <span>Beli: {formatCurrency(p.base_price)}</span>
                  <span>Jual: {formatCurrency(p.sell_price)}</span>
                </div>
              </div>
              <div className="product-row__right">
                <div className="product-row__stock">
                  <div className={`product-row__stock-value product-row__stock-value--${getStockClass(p)}`}>
                    {p.current_stock} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{p.unit}</span>
                  </div>
                  <div className="product-row__stock-label">
                    {p.current_stock <= 0 ? 'HABIS' : p.current_stock <= p.min_stock_threshold ? 'Stok rendah' : 'Stok aman'}
                  </div>
                </div>
                <div className="product-row__actions">
                  <button className="product-row__action-btn product-row__action-btn--edit" onClick={() => openEdit(p)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="product-row__action-btn product-row__action-btn--delete" onClick={() => setConfirmDelete(p)} title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </>
        }
      >
        {error && (
          <div className="products-modal__error">{error}</div>
        )}
        <div className="products-modal__form">
          <Input label="Nama Produk" placeholder="contoh: Indomie Goreng" value={form.name} onChange={(e) => setField('name', e.target.value)} id="modal-product-name" />
          <div className="products-modal__row">
            <Input label="Kategori" type="select" value={form.category} onChange={(e) => setField('category', e.target.value)} id="modal-product-category">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Input>
            <Input label="Satuan" placeholder="pcs, kg, liter" value={form.unit} onChange={(e) => setField('unit', e.target.value)} id="modal-product-unit" />
          </div>
          <div className="products-modal__row">
            <Input label="Harga Beli" type="number" placeholder="12000" value={form.base_price} onChange={(e) => setField('base_price', e.target.value)} id="modal-product-base-price" />
            <Input label="Harga Jual" type="number" placeholder="15000" value={form.sell_price} onChange={(e) => setField('sell_price', e.target.value)} id="modal-product-sell-price" />
          </div>
          <div className="products-modal__row">
            <Input label="Stok Saat Ini" type="number" placeholder="50" value={form.current_stock} onChange={(e) => setField('current_stock', e.target.value)} id="modal-product-stock" />
            <Input label="Batas Stok Minimum" type="number" placeholder="5" value={form.min_stock_threshold} onChange={(e) => setField('min_stock_threshold', e.target.value)} id="modal-product-min-stock" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="🗑️ Hapus Produk?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete?.id)}>Ya, Hapus</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          Yakin ingin menghapus <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete?.name}</strong>?
          Produk akan dihapus dari daftar secara permanen.
        </p>
      </Modal>
    </div>
  );
}
