import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import './Auth.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
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
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <Zap />
          <span>SPARK</span>
        </div>
        <h1 className="auth-card__title">Buat Akun</h1>
        <p className="auth-card__subtitle">Mulai kelola bisnis kamu dengan SPARK</p>

        {authError && (
          <div className="auth-card__error" onClick={clearError}>{authError}</div>
        )}

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <Input
            label="Nama Bisnis"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="contoh: Warung Bu Ani"
            id="register-business"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="register-email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="register-password"
          />
          <Button type="submit" variant="cta" fullWidth loading={loading} disabled={loading}>
            Daftar
          </Button>
        </form>

        <div className="auth-card__footer">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
