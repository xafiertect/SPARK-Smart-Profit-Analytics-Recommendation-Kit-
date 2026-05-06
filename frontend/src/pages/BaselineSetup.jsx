import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Save, Info, AlertCircle } from 'lucide-react';

export default function BaselineSetup() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        cost_price: '',
        selling_price: '',
        stock_quantity: '',
        unit: 'pcs'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/products/');
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                cost_price: parseFloat(formData.cost_price),
                selling_price: parseFloat(formData.selling_price),
                stock_quantity: parseInt(formData.stock_quantity)
            };
            
            await axios.post('http://localhost:8000/api/v1/products/', payload);
            setFormData({
                name: '',
                category: '',
                cost_price: '',
                selling_price: '',
                stock_quantity: '',
                unit: 'pcs'
            });
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.detail || 'Gagal menambahkan produk.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Hapus produk ini dari baseline?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/v1/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Gagal menghapus produk.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Package color="var(--primary)" />
                    <h3>Baseline Setup Module</h3>
                </div>
                
                <div style={{ background: 'rgba(52, 152, 219, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <Info color="var(--primary)" size={20} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Daftarkan semua produk Anda di sini. Data ini akan menjadi referensi AI saat memproses nota dan patokan untuk perhitungan stok serta keuntungan.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Nama Produk</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Contoh: Indomie Goreng" required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Kategori</label>
                        <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Makanan / Minuman" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Harga Beli (Modal)</label>
                        <input type="number" name="cost_price" value={formData.cost_price} onChange={handleInputChange} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Harga Jual</label>
                        <input type="number" name="selling_price" value={formData.selling_price} onChange={handleInputChange} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Stok Awal</label>
                        <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Satuan</label>
                        <select name="unit" value={formData.unit} onChange={handleInputChange} className="input">
                            <option value="pcs">Pcs</option>
                            <option value="kg">Kg</option>
                            <option value="liter">Liter</option>
                            <option value="box">Box</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                        {error && <p style={{ color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>}
                        <button type="submit" className="btn" disabled={isSaving} style={{ width: '100%' }}>
                            <Plus size={18} /> Daftarkan Produk ke Baseline
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Daftar Produk Terdaftar</h3>
                {loading ? (
                    <p>Memuat data...</p>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <AlertCircle size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Belum ada produk terdaftar. Silakan gunakan form di atas.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Kategori</th>
                                    <th className="text-right">Harga Modal</th>
                                    <th className="text-right">Harga Jual</th>
                                    <th className="text-right">Stok</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong><br/><small>{p.unit}</small></td>
                                        <td>{p.category || '-'}</td>
                                        <td className="text-right">Rp {parseFloat(p.cost_price).toLocaleString('id-ID')}</td>
                                        <td className="text-right">Rp {parseFloat(p.selling_price).toLocaleString('id-ID')}</td>
                                        <td className="text-right">{p.stock_quantity}</td>
                                        <td className="text-center">
                                            <button className="btn-secondary" style={{ color: 'var(--danger)', padding: '6px' }} onClick={() => deleteProduct(p.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
