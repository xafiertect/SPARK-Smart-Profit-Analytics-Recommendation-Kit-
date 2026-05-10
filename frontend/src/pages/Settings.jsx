import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: 'var(--space-md) var(--space-lg)', maxWidth: 600 }}>
      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
        ⚙️ Pengaturan
      </h1>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid rgba(51,65,85,0.5)',
        borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Nama Usaha</span>
          <p style={{ fontWeight: 600 }}>{user?.business_name || '-'}</p>
        </div>
        <div>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Email</span>
          <p style={{ fontWeight: 600 }}>{user?.email || '-'}</p>
        </div>
        <div>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>Versi</span>
          <p style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>SPARK v1.0.0</p>
        </div>
        <div style={{ borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: 'var(--space-md)' }}>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            <LogOut size={16} /> Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}
