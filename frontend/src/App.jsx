import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BaselineSetup from './pages/BaselineSetup';
import ReceiptUploader from './components/ReceiptUploader';
import ValidationTable from './components/ValidationTable';
import { useState } from 'react';
import { LogOut, LayoutDashboard, ScanLine, Package } from 'lucide-react';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function MainApp() {
    const { logout } = useAuth();
    const [extractedData, setExtractedData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="app-container">
            <nav className="glass-panel" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, background: 'linear-gradient(135deg, #a8c0ff, #3f2b96)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPARK</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button className={`btn-secondary ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', color: activeTab === 'dashboard' ? 'var(--primary)' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className={`btn-secondary ${activeTab === 'baseline' ? 'active' : ''}`} onClick={() => setActiveTab('baseline')} style={{ background: 'none', border: 'none', color: activeTab === 'baseline' ? 'var(--primary)' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Package size={18} /> Baseline Produk
                    </button>
                    <button className={`btn-secondary ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')} style={{ background: 'none', border: 'none', color: activeTab === 'scan' ? 'var(--primary)' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ScanLine size={18} /> Scan Nota
                    </button>
                    <button className="btn-secondary" onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LogOut size={18} /> Keluar
                    </button>
                </div>
            </nav>

            <main style={{ marginTop: '24px' }}>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'baseline' && <BaselineSetup />}
                {activeTab === 'scan' && (
                    <>
                        {!extractedData ? (
                            <ReceiptUploader onExtractComplete={setExtractedData} />
                        ) : (
                            <ValidationTable initialData={extractedData} onReset={() => setExtractedData(null)} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
