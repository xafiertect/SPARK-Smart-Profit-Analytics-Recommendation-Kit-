import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'spark-btn',
    `spark-btn--${variant}`,
    size !== 'md' && `spark-btn--${size}`,
    fullWidth && 'spark-btn--full',
    iconOnly && 'spark-btn--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="spark-btn__spinner" />}
      {children}
    </button>
  );
}
