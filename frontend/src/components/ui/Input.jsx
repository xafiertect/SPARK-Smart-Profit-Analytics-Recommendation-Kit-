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
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <label className="label-text" htmlFor={inputId}>
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`input ${error ? 'error' : ''}`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          className={`input ${error ? 'error' : ''}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`input ${error ? 'error' : ''}`}
          {...props}
        />
      )}
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.8125rem' }}>{error}</span>}
      {hint && !error && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{hint}</span>}
    </div>
  );
}
