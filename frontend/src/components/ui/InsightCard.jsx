import './InsightCard.css';
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
      className={`insight-card ${!insight.isRead ? 'insight-card--unread' : ''}`}
      onClick={() => onMarkRead?.(insight.id)}
    >
      <div className="insight-card__header">
        <div className="insight-card__trigger">
          <div className="insight-card__icon">
            <Icon size={16} />
          </div>
          <span className="insight-card__type">{meta.label}</span>
        </div>
        <span className="insight-card__time">{formatRelativeTime(insight.createdAt)}</span>
      </div>
      <p className="insight-card__text">{insight.text}</p>
      <div className="insight-card__actions">
        <button className="insight-card__dismiss" onClick={(e) => { e.stopPropagation(); onDismiss?.(insight.id); }}>
          Tutup
        </button>
      </div>
    </div>
  );
}
