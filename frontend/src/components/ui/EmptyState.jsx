import { Inbox } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="empty-state__title">{title || 'Belum ada data'}</h3>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </div>
  );
}
