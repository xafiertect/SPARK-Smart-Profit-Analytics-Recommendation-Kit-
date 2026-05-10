import './MetricCard.css';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function MetricCard({ label, value, trend, trendLabel, variant = 'revenue', icon }) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';

  return (
    <div className={`metric-card metric-card--${variant} animate-fade-in`}>
      {icon && <div className="metric-card__icon">{icon}</div>}
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{formatCurrency(value)}</span>
      {trend != null && (
        <span className={`metric-card__trend metric-card__trend--${trendDir}`}>
          {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'}
          {formatPercent(trend)}
          {trendLabel && <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}> {trendLabel}</span>}
        </span>
      )}
    </div>
  );
}
