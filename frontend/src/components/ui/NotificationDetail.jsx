import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { X, Package, ArrowRight, Eye, CheckCircle, XCircle, AlertTriangle, ClipboardList, Sparkles, Info } from 'lucide-react';
import useNotificationStore from '../../stores/notificationStore';
import Button from './Button';
import { formatRelativeTime, formatCurrency } from '../../utils/formatters';

const PRIORITY_META = {
  CRITICAL: { label: 'Kritis', color: 'var(--color-danger)', bg: 'rgba(244,63,94,0.15)', emoji: <AlertTriangle size={22} /> },
  WARNING: { label: 'Peringatan', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.15)', emoji: <AlertTriangle size={22} /> },
  ACTION_REQUIRED: { label: 'Perlu Tindakan', color: 'var(--spark-cyan)', bg: 'rgba(6,182,212,0.15)', emoji: <ClipboardList size={22} /> },
  NEW_PRODUCT: { label: 'Produk Baru', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.15)', emoji: <Sparkles size={22} /> },
  INFO: { label: 'Info', color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.15)', emoji: <Info size={22} /> },
};

export default function NotificationDetail({ notification, onClose }) {
  const navigate = useNavigate();
  const { markDone, dismiss, closePanel } = useNotificationStore();
  const meta = PRIORITY_META[notification.priority] || PRIORITY_META.INFO;
  const actionData = notification.action_data || {};

  const handlePrimaryAction = () => {
    const action = actionData.action;
    if (action === 'add_stock' || action === 'configure_product') {
      closePanel();
      onClose();
      navigate('/products');
    } else if (action === 'configure_new_products') {
      closePanel();
      onClose();
      navigate('/products');
    } else {
      closePanel();
      onClose();
      navigate('/');
    }
  };

  const handleDone = () => {
    markDone(notification.id);
  };

  const handleIgnore = () => {
    dismiss(notification.id);
  };

  // Build action buttons based on notification type
  const getPrimaryButtons = () => {
    const action = actionData.action;
    if (action === 'add_stock') {
      return (
        <Button variant="primary" onClick={handlePrimaryAction} id="notif-action-add-stock">
          <Package size={16} /> Tambah Stok Sekarang
        </Button>
      );
    }
    if (action === 'configure_product') {
      return (
        <Button variant="primary" onClick={handlePrimaryAction} id="notif-action-configure">
          <ArrowRight size={16} /> Atur Harga & Stok Minimal
        </Button>
      );
    }
    if (action === 'configure_new_products') {
      return (
        <Button variant="primary" onClick={handlePrimaryAction} id="notif-action-new-products">
          <Eye size={16} /> Lihat & Lengkapi Produk Baru
        </Button>
      );
    }
    return (
      <Button variant="primary" onClick={handlePrimaryAction} id="notif-action-view">
        <Eye size={16} /> Lihat Detail
      </Button>
    );
  };

  return createPortal(
    <div className="notif-detail-overlay" onClick={onClose}>
      <div className="notif-detail" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notif-detail__header">
          <div
            className="notif-detail__priority-icon"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.emoji}
          </div>
          <div className="notif-detail__header-text">
            <h3>{notification.title}</h3>
            <span>{meta.label} · {formatRelativeTime(notification.created_at)}</span>
          </div>
          <button className="notif-detail__close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="notif-detail__body">
          <p className="notif-detail__message">{notification.message}</p>

          {/* Data cards for stock notifications */}
          {(actionData.current_stock !== undefined || actionData.min_threshold !== undefined) && (
            <div className="notif-detail__data">
              {actionData.product_name && (
                <div className="notif-detail__data-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="notif-detail__data-label">Produk</div>
                  <div className="notif-detail__data-value">{actionData.product_name}</div>
                </div>
              )}
              {actionData.current_stock !== undefined && (
                <div className="notif-detail__data-item">
                  <div className="notif-detail__data-label">Stok Saat Ini</div>
                  <div className="notif-detail__data-value" style={{ color: actionData.current_stock <= 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                    {actionData.current_stock}
                  </div>
                </div>
              )}
              {actionData.min_threshold !== undefined && (
                <div className="notif-detail__data-item">
                  <div className="notif-detail__data-label">Batas Minimal</div>
                  <div className="notif-detail__data-value">{actionData.min_threshold}</div>
                </div>
              )}
            </div>
          )}

          {/* List new products */}
          {actionData.new_products && actionData.new_products.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {actionData.new_products.map((p, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Package size={14} style={{ color: 'var(--color-success)' }} />
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {notification.status !== 'DONE' && notification.status !== 'IGNORED' && (
          <div className="notif-detail__actions">
            <div className="notif-detail__actions-row">
              {getPrimaryButtons()}
            </div>
            <div className="notif-detail__secondary-actions">
              <Button variant="ghost" size="sm" onClick={handleIgnore} id="notif-action-ignore">
                <XCircle size={14} /> Abaikan
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDone} id="notif-action-done">
                <CheckCircle size={14} /> Tandai Selesai
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
