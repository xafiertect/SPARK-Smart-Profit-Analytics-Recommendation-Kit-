import { Loader2 } from 'lucide-react';

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
    `btn-${variant}`,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} style={fullWidth ? { width: '100%' } : {}} {...props}>
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
}
