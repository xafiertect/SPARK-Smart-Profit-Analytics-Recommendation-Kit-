import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useTilt } from '../../hooks/useTilt';

export default function MetricCard({ label, value, trend, trendLabel, variant = 'revenue', icon }) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  const borderColor = variant === 'revenue' ? 'var(--spark-cyan)' : variant === 'profit' ? 'var(--color-success)' : 'var(--color-danger)';
  const trendColor = trendDir === 'up' ? 'var(--color-success)' : trendDir === 'down' ? 'var(--color-danger)' : 'var(--text-muted)';
  const { ref, handlers } = useTilt({ max: 6, scale: 1.02 });

  return (
    <div
      ref={ref}
      {...handlers}
      className="card metric-card animate-fade-in"
      style={{ borderTop: `3px solid ${borderColor}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      {/* Mouse-follow inner glow */}
      <div className="metric-card__glow" style={{ '--glow-color': borderColor }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</span>
        {icon && <div className="metric-card__icon" style={{ color: borderColor }}>{icon}</div>}
      </div>
      <span className="rp-value" style={{ fontSize: '1.75rem', marginTop: '0.5rem', position: 'relative', zIndex: 1 }}>{formatCurrency(value)}</span>
      {trend != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: '0.25rem', position: 'relative', zIndex: 1 }}>
          <span style={{ color: trendColor, fontWeight: 500, backgroundColor: trendColor.replace(')', ', 0.15)').replace('rgb', 'rgba'), padding: '2px 6px', borderRadius: '4px' }}>
            {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {formatPercent(trend)}
          </span>
          {trendLabel && <span style={{ color: 'var(--text-disabled)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
