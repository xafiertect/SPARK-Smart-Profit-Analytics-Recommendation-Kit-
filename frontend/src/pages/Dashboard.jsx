import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, DollarSign, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const [finance, setFinance] = useState({ income: 0, expense: 0, profit: 0 });
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    useEffect(() => {
        fetchFinance();
    }, []);

    const fetchFinance = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/financial/summary');
            setFinance(res.data);
        } catch (err) {
            console.error('Failed to fetch financial data');
        }
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage;
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatMessage('');
        setIsChatLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/api/v1/consultant/chat', { message: userMsg });
            setChatHistory(prev => [...prev, { role: 'ai', content: res.data.reply }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'ai', content: 'Maaf, konsultan AI sedang tidak aktif.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--success)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Pendapatan</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp color="var(--success)" size={20} />
                        <h3>Rp {finance.income.toLocaleString('id-ID')}</h3>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Pengeluaran</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingDown color="var(--danger)" size={20} />
                        <h3>Rp {finance.expense.toLocaleString('id-ID')}</h3>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimasi Laba</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign color="var(--primary)" size={20} />
                        <h3>Rp {finance.profit.toLocaleString('id-ID')}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <MessageSquare color="var(--primary)" />
                    <h3>AI Business Consultant</h3>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatHistory.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                            Tanyakan apa saja tentang kondisi bisnis Anda kepada AI Consultant.
                        </p>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} style={{ 
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            maxWidth: '80%',
                            fontSize: '0.95rem'
                        }}>
                            {msg.content}
                        </div>
                    ))}
                    {isChatLoading && <Loader2 className="spinner" size={20} style={{ margin: '0 auto' }} />}
                </div>

                <form onSubmit={handleChat} style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        style={{ flex: 1 }} 
                        placeholder="Tanyakan sesuatu..." 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <button type="submit" className="btn" disabled={isChatLoading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
