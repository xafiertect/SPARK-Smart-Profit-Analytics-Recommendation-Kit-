import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, CheckCircle, Store, Package, ClipboardCheck, ArrowRight } from 'lucide-react';
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
      navigate('/dashboard');
    } catch (e) {
      setError(e.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const validProducts = products.filter((p) => p.name.trim());

  const STEPS = [
    { icon: <Store size={18} />, label: 'Bisnis' },
    { icon: <Package size={18} />, label: 'Produk' },
    { icon: <ClipboardCheck size={18} />, label: 'Konfirmasi' },
  ];

  return (
    <div className="onboarding-page animate-fade-in">
      <div className="onboarding-card">
        <div className="onboarding__progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`onboarding__progress-step ${i + 1 < step ? 'onboarding__progress-step--done' : i + 1 === step ? 'onboarding__progress-step--active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="onboarding__step animate-slide-up" key="step1">
            <div className="onboarding__step-header">
              <div className="onboarding__step-icon"><Store size={32} /></div>
              <h2>Profil Bisnis</h2>
              <p>Ceritakan sedikit tentang usahamu.</p>
            </div>
            <div className="onboarding__form">
              <Input label="Nama Usaha" placeholder="contoh: Kedai Kopi" value={businessName} onChange={(e) => setBusinessName(e.target.value)} id="input-business-name" />
              <Input label="Kategori Bisnis" type="select" value={businessType} onChange={(e) => setBusinessType(e.target.value)} id="input-business-type">
                <option>Warung / Toko Kelontong</option>
                <option>Warung Makan</option>
                <option>Toko Online</option>
                <option>Jasa</option>
                <option>Lainnya</option>
              </Input>
            </div>
            <div className="onboarding__actions">
              <Button variant="primary" fullWidth onClick={() => setStep(2)} disabled={!businessName.trim()} id="btn-next-step1">
                Lanjut <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__step animate-slide-up" key="step2">
            <div className="onboarding__step-header">
              <div className="onboarding__step-icon"><Package size={32} /></div>
              <h2>Daftar Produk</h2>
              <p>Masukkan produk pertama yang kamu jual. Kamu bisa menambahkannya lagi nanti.</p>
            </div>
            <div className="onboarding__product-list">
              {products.map((p, idx) => (
                <div key={idx} className="onboarding__product-item">
                  <div className="onboarding__product-item-header">
                    <span className="onboarding__product-item-title">Produk #{idx + 1}</span>
                    {products.length > 1 && (
                      <button className="onboarding__product-item-remove" onClick={() => removeProduct(idx)} aria-label="Hapus produk"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div className="onboarding__product-fields">
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Input label="Nama Produk" placeholder="contoh: Gula Pasir 1kg" value={p.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} />
                    </div>
                    <Input label="Kategori" type="select" value={p.category} onChange={(e) => updateProduct(idx, 'category', e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </Input>
                    <Input label="Satuan" placeholder="pcs/kg" value={p.unit} onChange={(e) => updateProduct(idx, 'unit', e.target.value)} />
                    <Input label="Harga Beli" type="number" placeholder="12000" value={p.base_price} onChange={(e) => updateProduct(idx, 'base_price', e.target.value)} />
                    <Input label="Harga Jual" type="number" placeholder="15000" value={p.sell_price} onChange={(e) => updateProduct(idx, 'sell_price', e.target.value)} />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Input label="Stok Awal" type="number" placeholder="50" value={p.current_stock} onChange={(e) => updateProduct(idx, 'current_stock', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" fullWidth onClick={addRow} style={{ border: '1px dashed var(--bg-border)' }}>
              <Plus size={16} /> Tambah Produk
            </Button>
            <div className="onboarding__actions">
              <Button variant="secondary" onClick={() => setStep(1)}>Kembali</Button>
              <Button variant="primary" style={{ flex: 1 }} onClick={() => setStep(3)} disabled={validProducts.length === 0} id="btn-next-step2">
                Review & Lanjut
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding__step animate-slide-up" key="step3">
            <div className="onboarding__step-header">
              <div className="onboarding__step-icon" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--color-success)', boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)' }}>
                <ClipboardCheck size={32} />
              </div>
              <h2>Review Akhir</h2>
              <p>Pastikan data bisnismu sudah benar sebelum memulai.</p>
            </div>
            {error && (
              <div className="onboarding__error">
                {error}
              </div>
            )}
            <div className="onboarding__review">
              <div className="onboarding__review-card">
                <div className="onboarding__review-row">
                  <h4>Nama Usaha</h4>
                  <p>{businessName}</p>
                </div>
                <div className="onboarding__review-row">
                  <h4>Jenis Bisnis</h4>
                  <p>{businessType}</p>
                </div>
              </div>
              
              <div className="onboarding__review-card">
                <h4>Data Produk <span style={{ background: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{validProducts.length} Item</span></h4>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {validProducts.map((p, i) => (
                    <div key={i} className="onboarding__review-product">
                      <span className="onboarding__review-product-name">{p.name}</span>
                      <span className="onboarding__review-product-price">{formatCurrency(Number(p.sell_price))} <span style={{ color: 'var(--text-disabled)' }}>({p.current_stock || 0} stok)</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="onboarding__actions">
              <Button variant="secondary" onClick={() => setStep(2)}>Ubah Data</Button>
              <Button variant="success" style={{ flex: 1 }} onClick={handleFinish} loading={saving} disabled={saving} id="btn-finish-onboarding">
                Mulai Gunakan SPARK <CheckCircle size={18} style={{ marginLeft: '8px' }} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
