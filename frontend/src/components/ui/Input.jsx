import './Input.css';

export default function Input({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`spark-input-group ${className}`}>
      {label && (
        <label className="spark-input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`spark-input spark-textarea ${error ? 'spark-input--error' : ''}`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          className={`spark-input spark-select ${error ? 'spark-input--error' : ''}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`spark-input ${error ? 'spark-input--error' : ''}`}
          {...props}
        />
      )}
      {error && <span className="spark-input-error">{error}</span>}
      {hint && !error && <span className="spark-input-hint">{hint}</span>}
    </div>
  );
}
