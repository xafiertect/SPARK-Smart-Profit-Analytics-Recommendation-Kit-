import './Card.css';

export default function Card({
  children,
  variant,
  interactive = false,
  className = '',
  ...props
}) {
  const classes = [
    'spark-card',
    variant && `spark-card--${variant}`,
    interactive && 'spark-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
