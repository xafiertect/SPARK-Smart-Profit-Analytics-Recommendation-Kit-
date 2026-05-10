import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, CheckCircle, Store, Package, ClipboardCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import useBusinessStore from '../stores/businessStore';
import { formatCurrency } from '../utils/formatters';
import './Onboarding.css';

const EMPTY_PRODUCT = { name: '', category: 'Sembako', unit: 'pcs', base_price: '', sell_price: '', current_stock: '' };
const CATEGORIES = ['Sembako', 'Makanan', 'Minuman', 'Rokok', 'Kebutuhan', 'Lainnya'];

export default function Onboarding() {
  const navigate = useNavigate();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const addProduct = useBusinessStore((s) => s.addProduct);

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Warung / Toko Kelontong');
  const [products, setProducts] = useState([{ ...EMPTY_PRODUCT }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateProduct = (idx, field, value) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeProduct = (idx) => setProducts((prev) => prev.filter((_, i) => i !== idx));
  const addRow = () => setProducts((prev) => [...prev, { ...EMPTY_PRODUCT }]);

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const p of products) {
        if (p.name.trim()) {
          await addProduct({
            name: p.name,
            category: p.category,
            unit: p.unit,
            base_price: Number(p.base_price) || 0,
            sell_price: Number(p.sell_price) || 0,
            current_stock: Number(p.current_stock) || 0,
            min_stock_threshold: 5,
          });
        }
      }
      setOnboarded(true);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const validProducts = products.filter((p) => p.name.trim());

  const STEPS = [
    { icon: <Store size={16} />, label: 'Bisnis' },
    { icon: <Package size={16} />, label: 'Produk' },
    { icon: <ClipboardCheck size={16} />, label: 'Review' },
  ];

  return (
    <div className="onboarding">
      <div className="onboarding__progress">
        {STEPS.map((s, i) => (
          <div key={i} className={`onboarding__progress-step ${i + 1 < step ? 'onboarding__progress-step--done' : i + 1 === step ? 'onboarding__progress-step--active' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="onboarding__step" key="step1">
          <h2>🏪 Info Bisnis Kamu</h2>
          <p>Ceritakan sedikit tentang usahamu</p>
          <div className="onboarding__form">
            <Input label="Nama Usaha" placeholder="contoh: Warung Bu Ani" value={businessName} onChange={(e) => setBusinessName(e.target.value)} id="input-business-name" />
            <Input label="Jenis Usaha" type="select" value={businessType} onChange={(e) => setBusinessType(e.target.value)} id="input-business-type">
              <option>Warung / Toko Kelontong</option>
              <option>Warung Makan</option>
              <option>Toko Online</option>
              <option>Jasa</option>
              <option>Lainnya</option>
            </Input>
          </div>
          <div className="onboarding__actions">
            <Button variant="primary" fullWidth onClick={() => setStep(2)} disabled={!businessName.trim()} id="btn-next-step1">Lanjut</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding__step" key="step2">
          <h2>📦 Daftar Produk</h2>
          <p>Masukkan produk yang kamu jual. Bisa ditambah nanti.</p>
          <div className="onboarding__product-list">
            {products.map((p, idx) => (
              <div key={idx} className="onboarding__product-item">
                <div className="onboarding__product-item-header">
                  <span className="onboarding__product-item-title">Produk #{idx + 1}</span>
                  {products.length > 1 && (
                    <button className="onboarding__product-item-remove" onClick={() => removeProduct(idx)}><Trash2 size={14} /></button>
                  )}
                </div>
                <div className="onboarding__product-fields">
                  <Input label="Nama" placeholder="Indomie Goreng" value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                  <Input label="Kategori" type="select" value={p.category} onChange={(e) => updateProduct(idx, 'category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Input>
                  <Input label="Harga Beli" type="number" placeholder="2800" value={p.base_price} onChange={(e) => updateProduct(idx, 'base_price', e.target.value)} />
                  <Input label="Harga Jual" type="number" placeholder="3500" value={p.sell_price} onChange={(e) => updateProduct(idx, 'sell_price', e.target.value)} />
                  <Input label="Satuan" placeholder="pcs" value={p.unit} onChange={(e) => updateProduct(idx, 'unit', e.target.value)} />
                  <Input label="Stok Awal" type="number" placeholder="50" value={p.current_stock} onChange={(e) => updateProduct(idx, 'current_stock', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" fullWidth onClick={addRow}><Plus size={16} /> Tambah Produk</Button>
          <div className="onboarding__actions">
            <Button variant="secondary" onClick={() => setStep(1)}>Kembali</Button>
            <Button variant="primary" fullWidth onClick={() => setStep(3)} disabled={validProducts.length === 0} id="btn-next-step2">Review</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding__step" key="step3">
          <h2>📋 Review & Konfirmasi</h2>
          <p>Pastikan semua data sudah benar</p>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--accent-red)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)' }}>
              {error}
            </div>
          )}
          <div className="onboarding__review">
            <div className="onboarding__review-card"><h4>Nama Usaha</h4><p>{businessName}</p></div>
            <div className="onboarding__review-card"><h4>Jenis Usaha</h4><p>{businessType}</p></div>
            <div className="onboarding__review-card">
              <h4>{validProducts.length} Produk</h4>
              {validProducts.map((p, i) => (
                <div key={i} className="onboarding__review-product">
                  <span className="onboarding__review-product-name">{p.name}</span>
                  <span className="onboarding__review-product-price">{formatCurrency(Number(p.sell_price))} · Stok: {p.current_stock || 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="onboarding__actions">
            <Button variant="secondary" onClick={() => setStep(2)}>Edit</Button>
            <Button variant="success" fullWidth onClick={handleFinish} loading={saving} disabled={saving} id="btn-finish-onboarding">
              <CheckCircle size={18} /> Mulai Pakai SPARK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
