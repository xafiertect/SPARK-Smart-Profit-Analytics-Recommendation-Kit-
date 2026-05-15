export function ChatBubble({ message, sender = 'user', time }) {
  const isUser = sender === 'user';
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: '1rem' }}>
      {!isUser && (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-spark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '0.875rem' }}>
          ✦
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: isUser ? 'var(--gradient-spark)' : 'var(--bg-surface-2)',
          color: isUser ? 'white' : 'var(--text-primary)',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          border: isUser ? 'none' : '1px solid var(--bg-border)',
          fontSize: '0.9375rem',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
        {time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{time}</span>}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', alignSelf: 'flex-start', maxWidth: '80%', marginBottom: '1rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-spark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '0.875rem' }}>
        ✦
      </div>
      <div style={{ background: 'var(--bg-surface-2)', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--bg-border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />
        <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animationDelay: '150ms' }} />
        <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
