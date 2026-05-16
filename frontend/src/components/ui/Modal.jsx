import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
    }} onClick={onClose}>
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, wordBreak: 'break-word', paddingRight: '12px' }}>{title}</h2>
          <button onClick={onClose} aria-label="Tutup" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface-2)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {children}
        </div>
        {footer && <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--bg-border)', flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
