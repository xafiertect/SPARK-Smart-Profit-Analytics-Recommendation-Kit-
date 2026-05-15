import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Moon, Sun, Monitor } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
        ⚙️ Pengaturan
      </h1>
      
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <User size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Nama Usaha</span>
            <p style={{ fontWeight: 700, margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '1.125rem' }}>{user?.business_name || '-'}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Mail size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Email</span>
            <p style={{ fontWeight: 600, margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{user?.email || '-'}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed var(--bg-border)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Tampilan Tema</p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pilih tema favoritmu</span>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
            <button 
              onClick={() => setTheme('light')}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: theme === 'light' ? 'var(--bg-surface)' : 'transparent', color: theme === 'light' ? 'var(--spark-cyan)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sun size={16} /> <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Terang</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: theme === 'dark' ? 'var(--bg-surface)' : 'transparent', color: theme === 'dark' ? 'var(--spark-cyan)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Moon size={16} /> <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Gelap</span>
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed var(--bg-border)', paddingTop: '24px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Versi Aplikasi</span>
          <p style={{ fontWeight: 700, margin: '4px 0 0 0', color: 'var(--spark-cyan)', display: 'inline-block', padding: '4px 12px', background: 'rgba(34, 211, 238, 0.1)', borderRadius: 'var(--radius-full)' }}>SPARK v1.0.0 Antigravity</p>
        </div>
        
        <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '24px' }}>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: '8px' }} /> Keluar Akun
          </Button>
        </div>
      </div>
    </div>
  );
}
