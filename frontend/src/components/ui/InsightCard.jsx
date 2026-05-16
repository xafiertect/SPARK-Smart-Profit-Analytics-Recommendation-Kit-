import { formatRelativeTime } from '../../utils/formatters';
import { AlertTriangle, TrendingDown, Package, DollarSign } from 'lucide-react';

const TRIGGER_META = {
  LOW_STOCK: { label: 'Stok Menipis', Icon: Package },
  EXPENSE_SPIKE: { label: 'Lonjakan Pengeluaran', Icon: TrendingDown },
  DEAD_STOCK: { label: 'Produk Tidak Laku', Icon: AlertTriangle },
  NEGATIVE_CASHFLOW: { label: 'Arus Kas Negatif', Icon: DollarSign },
};

export default function InsightCard({ insight, onDismiss, onMarkRead }) {
  const meta = TRIGGER_META[insight.triggerType] || TRIGGER_META.LOW_STOCK;
  const { Icon } = meta;

  return (
    <div
      onClick={() => onMarkRead?.(insight.id)}
      style={{
        padding: '1rem',
        backgroundColor: insight.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
        border: '1px solid var(--bg-border)',
        borderLeft: insight.isRead ? '1px solid var(--bg-border)' : '3px solid var(--spark-cyan)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--spark-cyan)' }}>
          <Icon size={16} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{meta.label}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatRelativeTime(insight.createdAt)}</span>
      </div>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', margin: 0 }}>{insight.text}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); onDismiss?.(insight.id); }}>
          Tutup
        </button>
      </div>
    </div>
  );
}
