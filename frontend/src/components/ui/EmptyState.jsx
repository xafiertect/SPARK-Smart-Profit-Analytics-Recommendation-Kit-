import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title, text, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--bg-border)' }}>
      <div style={{ color: 'var(--text-disabled)', marginBottom: '1rem', padding: '1rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-full)' }}>
        {icon || <Inbox size={32} />}
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title || 'Belum ada data'}</h3>
      {text && <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '300px' }}>{text}</p>}
      {action}
    </div>
  );
}
