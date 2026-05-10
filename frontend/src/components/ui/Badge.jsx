import './Badge.css';

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`spark-badge spark-badge--${variant} ${dot ? 'spark-badge--dot' : ''} ${className}`}>
      {children}
    </span>
  );
}
