import { useEffect } from 'react';
import useBusinessStore from '../stores/businessStore';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';
import './Products.css';

export default function Products() {
  const { products, fetchProducts, productsLoading } = useBusinessStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStockClass = (p) => {
    if (p.current_stock <= 0) return 'zero';
    if (p.current_stock <= p.min_stock_threshold) return 'low';
    return 'ok';
  };

  if (productsLoading && products.length === 0) {
    return (
      <div className="products-page">
        <div style={{ padding: 'var(--space-xl)', color: 'var(--text-muted)', textAlign: 'center' }}>
          Memuat produk...
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header animate-fade-in">
        <h1>📦 Produk</h1>
        <Badge variant="info">{products.length} item</Badge>
      </div>
      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          text="Tambahkan produk lewat onboarding atau langsung di sini."
        />
      ) : (
        <div className="products-page__grid stagger-children">
          {products.map((p) => (
            <div key={p.id} className="product-row" id={`product-${p.id}`}>
              <div className="product-row__info">
                <span className="product-row__name">{p.name}</span>
                <div className="product-row__meta">
                  <Badge variant="neutral">{p.category || '-'}</Badge>
                  <span>Beli: {formatCurrency(p.base_price)}</span>
                  <span>Jual: {formatCurrency(p.sell_price)}</span>
                </div>
              </div>
              <div className="product-row__stock">
                <div className={`product-row__stock-value product-row__stock-value--${getStockClass(p)}`}>
                  {p.current_stock} {p.unit}
                </div>
                <div className="product-row__stock-label">
                  {p.current_stock <= 0 ? 'HABIS' : p.current_stock <= p.min_stock_threshold ? 'Stok rendah' : 'Stok aman'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
