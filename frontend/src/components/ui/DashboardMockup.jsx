import { Zap, LayoutDashboard, ScanLine, Package, MessageCircle, BarChart3, Bell } from 'lucide-react';
import './DashboardMockup.css';

export default function DashboardMockup() {
  return (
    <div className="mockup-container">
      {/* Sidebar */}
      <div className="mockup-sidebar">
        <div className="mockup-logo">
          <Zap size={18} />
        </div>
        <div className="mockup-nav">
          <div className="mockup-nav-item active">
            <LayoutDashboard size={20} />
          </div>
          <div className="mockup-nav-item">
            <ScanLine size={20} />
          </div>
          <div className="mockup-nav-item">
            <Package size={20} />
          </div>
          <div className="mockup-nav-item">
            <BarChart3 size={20} />
          </div>
          <div className="mockup-nav-item">
            <MessageCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mockup-main">
        {/* Header */}
        <div className="mockup-header">
          <h2>Selamat datang, Toko Berkah 👋</h2>
          <div className="mockup-header-right">
            <div className="mockup-notification">
              <Bell size={20} />
              <span className="mockup-badge"></span>
            </div>
            <div className="mockup-avatar">TB</div>
          </div>
        </div>

        {/* 3 Cards */}
        <div className="mockup-cards">
          <div className="mockup-card">
            <span className="mockup-card-title">Pendapatan Hari Ini</span>
            <span className="mockup-card-value">Rp 1.250.000</span>
          </div>
          <div className="mockup-card">
            <span className="mockup-card-title">Pengeluaran</span>
            <span className="mockup-card-value">Rp 430.000</span>
          </div>
          <div className="mockup-card">
            <span className="mockup-card-title">Profit Bersih</span>
            <span className="mockup-card-value" style={{ color: 'var(--color-success)' }}>Rp 820.000</span>
          </div>
        </div>

        <div className="mockup-bottom-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Chart */}
            <div className="mockup-panel" style={{ height: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="mockup-panel-title">Pendapatan 7 Hari</h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>1H</span>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', background: 'var(--spark-cyan)', color: '#000', fontWeight: 'bold' }}>7H</span>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>1B</span>
                  <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>1T</span>
                </div>
              </div>
              <div className="mockup-chart">
                <div className="mockup-bar" style={{ height: '40%' }}></div>
                <div className="mockup-bar" style={{ height: '60%' }}></div>
                <div className="mockup-bar" style={{ height: '45%' }}></div>
                <div className="mockup-bar" style={{ height: '80%' }}></div>
                <div className="mockup-bar" style={{ height: '55%' }}></div>
                <div className="mockup-bar" style={{ height: '70%' }}></div>
                <div className="mockup-bar active" style={{ height: '90%' }}></div>
              </div>
            </div>

            {/* Table */}
            <div className="mockup-panel" style={{ flex: 1 }}>
              <h3 className="mockup-panel-title">Transaksi Terbaru</h3>
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mie Instan</td>
                    <td>10 pcs</td>
                    <td>Rp 35.000</td>
                    <td style={{ color: 'var(--text-muted)' }}>10:23</td>
                  </tr>
                  <tr>
                    <td>Gula Pasir</td>
                    <td>5 kg</td>
                    <td>Rp 72.500</td>
                    <td style={{ color: 'var(--text-muted)' }}>09:45</td>
                  </tr>
                  <tr>
                    <td>Kopi Bubuk</td>
                    <td>2 pcs</td>
                    <td>Rp 30.000</td>
                    <td style={{ color: 'var(--text-muted)' }}>08:12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (AI Card) */}
          <div className="mockup-ai-card">
            <div className="mockup-ai-title">
              <Zap size={16} /> Rekomendasi AI
            </div>
            <p className="mockup-ai-text">
              <strong>Restock Mie Instan segera.</strong><br/><br/>
              Stok tersisa 20 unit, diperkirakan habis dalam 2 hari berdasarkan rata-rata penjualan 15 unit/hari.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
