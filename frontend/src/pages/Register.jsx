import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const register = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.authError);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(email, password, businessName);
    setLoading(false);
    if (success) {
      navigate('/onboarding');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Back Button */}
      <Link to="/" style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', zIndex: 30, fontWeight: 500, fontSize: '0.875rem' }}>
        <ArrowLeft size={18} /> Kembali ke Beranda
      </Link>

      {/* Dynamic Background Particles */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at center, var(--spark-cyan) 2px, transparent 2px)', backgroundSize: '60px 60px', animation: 'float 20s linear infinite', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      <div className={`login-panel ${shake ? 'animate-shake' : ''}`} style={{ 
        width: '100%', 
        maxWidth: '420px', 
        backgroundColor: 'var(--bg-surface)', 
        backdropFilter: 'blur(24px)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: 'var(--radius-xl)',
        padding: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, var(--glow-purple)',
        margin: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--gradient-spark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(167,139,250,0.3)' }}>
            <Zap size={24} />
          </div>
          SPARK
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Buat Akun Baru ✨</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Daftarkan bisnismu sekarang juga.</p>
        </div>

        {authError && (
          <div onClick={clearError} style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>Nama Bisnis</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input"
                style={{ paddingLeft: '48px', height: '48px', width: '100%', background: 'var(--bg-base)' }}
                placeholder="contoh: Kedai Kopi"
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                style={{ paddingLeft: '48px', height: '48px', width: '100%', background: 'var(--bg-base)' }}
                placeholder="nama@bisnis.com"
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                style={{ paddingRight: '48px', height: '48px', width: '100%', background: 'var(--bg-base)' }}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: '16px', height: '48px', fontSize: '1rem', background: 'var(--gradient-spark)', border: 'none' }}>
            Daftar Sekarang
          </Button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--spark-cyan)', fontWeight: 600, textDecoration: 'none' }}>Masuk di sini</Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .login-panel {
            padding: 24px !important;
            margin: 16px !important;
          }
          h2 {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
