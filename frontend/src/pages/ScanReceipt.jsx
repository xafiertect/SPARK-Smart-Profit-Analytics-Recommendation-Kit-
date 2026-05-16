import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptUploader from '../components/receipt/ReceiptUploader';
import useTransactionStore from '../stores/transactionStore';
import useUiStore from '../stores/uiStore';
import Button from '../components/ui/Button';
import { PenLine } from 'lucide-react';
import './ScanReceipt.css';

export default function ScanReceipt() {
  const navigate = useNavigate();
  const scanReceiptFile = useTransactionStore((s) => s.scanReceiptFile);
  const { scanStatus, setScanStatus } = useUiStore();
  const fileRef = useRef(null);
  const [error, setError] = useState(null);

  const handleScan = async (fileOrPreview) => {
    setScanStatus('scanning');
    setError(null);

    try {
      // Get the actual File object from the hidden input
      const inputEl = document.getElementById('receipt-file-input');
      const file = inputEl?.files?.[0];

      if (!file) {
        setError('Pilih file foto nota terlebih dahulu.');
        setScanStatus('error');
        return;
      }

      await scanReceiptFile(file);
      setScanStatus('parsed');
      navigate('/validation');
    } catch (e) {
      setError(e.message || 'Gagal scan nota. Coba lagi.');
      setScanStatus('error');
    }
  };

  return (
    <div className="scan-page">
      <div className="scan-page__header animate-fade-in">
        <h1>📸 Scan Nota</h1>
        <p>Foto nota belanja dan biarkan AI membacanya untuk kamu</p>
      </div>
      {error && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          color: 'var(--accent-red)',
          fontSize: 'var(--font-sm)',
          marginBottom: 'var(--space-md)',
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <ReceiptUploader onScan={handleScan} isScanning={scanStatus === 'scanning'} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '1px', background: 'var(--bg-elevated)', flex: 1 }}></div>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ATAU</span>
          <div style={{ height: '1px', background: 'var(--bg-elevated)', flex: 1 }}></div>
        </div>

        <Button 
          variant="secondary" 
          onClick={() => navigate('/income/manual')} 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <PenLine size={20} />
          + Input Manual
        </Button>
      </div>
    </div>
  );
}
