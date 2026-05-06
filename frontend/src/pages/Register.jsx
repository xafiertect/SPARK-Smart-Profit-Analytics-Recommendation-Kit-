import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Store } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/v1/auth/register', {
                email,
                password,
                business_name: businessName
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registrasi gagal.');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Store size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                    <h2>Daftar SPARK</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Mulai kelola bisnis Anda secara pintar</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Nama Bisnis</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                    </div>
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
                        <UserPlus size={18} /> Buat Akun
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
                    Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
}
