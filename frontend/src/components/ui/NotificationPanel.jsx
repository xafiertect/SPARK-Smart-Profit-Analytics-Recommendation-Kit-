import { useEffect, useState } from 'react';
import { X, Bell, RefreshCw, CheckCircle, AlertTriangle, Package, ClipboardList, Sparkles, Info } from 'lucide-react';
import useNotificationStore from '../../stores/notificationStore';
import NotificationDetail from './NotificationDetail';
import Button from './Button';
import { formatRelativeTime } from '../../utils/formatters';
import './NotificationPanel.css';

const PRIORITY_META = {
  CRITICAL: { icon: '🔴', label: 'Kritis', emoji: <AlertTriangle size={18} /> },
  WARNING: { icon: '⚠️', label: 'Peringatan', emoji: <AlertTriangle size={18} /> },
  ACTION_REQUIRED: { icon: '📋', label: 'Perlu Tindakan', emoji: <ClipboardList size={18} /> },
  NEW_PRODUCT: { icon: '🆕', label: 'Produk Baru', emoji: <Sparkles size={18} /> },
  INFO: { icon: 'ℹ️', label: 'Info', emoji: <Info size={18} /> },
};

export default function NotificationPanel() {
  const {
    notifications, loading, panelOpen, selectedNotification,
    closePanel, fetchNotifications, fetchUnreadCount, runCheck,
    selectNotification, clearSelection, markRead,
  } = useNotificationStore();

  const [tab, setTab] = useState('active'); // 'active' | 'done'

  useEffect(() => {
    if (panelOpen) {
      fetchNotifications();
    }
  }, [panelOpen, fetchNotifications]);

  if (!panelOpen) return null;

  const activeNotifs = notifications.filter((n) => n.status === 'NEW' || n.status === 'READ');
  const doneNotifs = notifications.filter((n) => n.status === 'DONE' || n.status === 'IGNORED');
  const displayNotifs = tab === 'active' ? activeNotifs : doneNotifs;

  const handleItemClick = (notif) => {
    if (notif.status === 'NEW') {
      markRead(notif.id);
    }
    selectNotification(notif);
  };

  return (
    <>
      {/* Overlay */}
      <div className="notif-overlay" onClick={closePanel} />

      {/* Panel */}
      <div className="notif-panel">
        {/* Header */}
        <div className="notif-panel__header">
          <h2>
            <Bell size={20} /> Notifikasi
          </h2>
          <div className="notif-panel__header-actions">
            <Button variant="ghost" size="sm" onClick={runCheck} loading={loading} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
            <button onClick={closePanel} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="notif-panel__tabs">
          <button
            className={`notif-panel__tab ${tab === 'active' ? 'notif-panel__tab--active' : ''}`}
            onClick={() => setTab('active')}
          >
            Aktif {activeNotifs.length > 0 && `(${activeNotifs.length})`}
          </button>
          <button
            className={`notif-panel__tab ${tab === 'done' ? 'notif-panel__tab--active' : ''}`}
            onClick={() => setTab('done')}
          >
            Selesai
          </button>
        </div>

        {/* List */}
        <div className="notif-panel__list">
          {displayNotifs.length === 0 ? (
            <div className="notif-panel__empty">
              <CheckCircle size={40} className="notif-panel__empty-icon" />
              <p style={{ fontWeight: 600 }}>
                {tab === 'active' ? 'Tidak ada notifikasi aktif' : 'Belum ada notifikasi selesai'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {tab === 'active' ? 'Semua baik! Klik refresh untuk cek ulang.' : ''}
              </p>
            </div>
          ) : (
            displayNotifs.map((notif) => {
              const meta = PRIORITY_META[notif.priority] || PRIORITY_META.INFO;
              return (
                <div
                  key={notif.id}
                  className={`notif-item notif-item--${notif.priority} ${notif.status === 'NEW' ? 'notif-item--unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                  id={`notif-${notif.id}`}
                >
                  <div className={`notif-item__icon notif-item__icon--${notif.priority}`}>
                    {meta.emoji}
                  </div>
                  <div className="notif-item__body">
                    <span className="notif-item__title">{notif.title}</span>
                    <span className="notif-item__preview">{notif.message}</span>
                    <span className="notif-item__time">{formatRelativeTime(notif.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <NotificationDetail
          notification={selectedNotification}
          onClose={clearSelection}
        />
      )}
    </>
  );
}
