import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Store } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Login gagal. Periksa kembali email dan password Anda.');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Store size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                    <h2>Masuk ke SPARK</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Asisten Finansial UMKM Pintar</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}
                    <button type="submit" className="btn" style={{ marginTop: '16px' }}>
                        <LogIn size={18} /> Masuk Sekarang
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
                    Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Daftar di sini</Link>
                </p>
            </div>
        </div>
    );
}
