import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ScanLine, MessageCircle, BarChart3, Package, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import Button from '../components/ui/Button';
import './Landing.css';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.dataset.theme || localStorage.getItem('spark-theme') || 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('spark-theme', next);
  };

  return (
    <button onClick={toggle} aria-label="Toggle Theme" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page animate-fade-in">
      {/* Navbar */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-navbar__left">
          <div className="landing-logo">
            <Zap size={24} />
          </div>
          <span className="landing-brand">SPARK</span>
        </div>
        
        <div className="landing-navbar__center">
          <button onClick={() => scrollToSection('fitur')} className="landing-nav-link" style={{ background: 'none', border: 'none' }}>Fitur</button>
          <button onClick={() => scrollToSection('cara-kerja')} className="landing-nav-link" style={{ background: 'none', border: 'none' }}>Cara Kerja</button>
          <button onClick={() => scrollToSection('keunggulan')} className="landing-nav-link" style={{ background: 'none', border: 'none' }}>Keunggulan</button>
        </div>

        <div className="landing-navbar__right">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          <Button variant="primary" onClick={() => navigate('/register')}>Sign Up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-slide-up">SPARK — Asisten Keuangan Cerdas untuk UMKM Anda</h1>
          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Dari scan nota hingga rekomendasi bisnis — otomatis, akurat, dan mudah dipahami.
          </p>
          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="primary" onClick={() => navigate('/register')} style={{ fontSize: '1.125rem', padding: '16px 32px' }}>
              Mulai Gratis <Zap size={20} style={{ marginLeft: '8px' }} />
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection('fitur')} style={{ fontSize: '1.125rem', padding: '16px 32px', border: '1px solid rgba(255,255,255,0.2)' }}>
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        <div className="hero-mockup animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="hero-mockup-placeholder">
            <BarChart3 size={64} style={{ color: 'var(--spark-cyan)' }} />
            <p>Dashboard Preview</p>
          </div>
        </div>
      </header>

      {/* Problem Statement */}
      <section className="section" id="masalah">
        <div className="section-header">
          <h2 className="section-title">Mengapa Anda Butuh SPARK?</h2>
          <p className="section-subtitle">Tinggalkan cara lama. Kami menyelesaikan 3 masalah utama bisnis Anda.</p>
        </div>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon">
              <Package size={28} />
            </div>
            <h3>Stok Habis Mendadak</h3>
            <p>Sering kehabisan barang terlaris karena tidak ada sistem peringatan stok otomatis.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon" style={{ color: 'var(--accent-red)', background: 'rgba(248, 113, 113, 0.1)' }}>
              <TrendingUp size={28} />
            </div>
            <h3>Profit Tidak Terpantau</h3>
            <p>Pembukuan manual membuat Anda tidak tahu pasti berapa profit riil bisnis setiap harinya.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon" style={{ color: 'var(--spark-cyan)', background: 'rgba(34, 211, 238, 0.1)' }}>
              <Lightbulb size={28} />
            </div>
            <h3>Keputusan Tanpa Data</h3>
            <p>Hanya mengandalkan intuisi untuk belanja stok atau promosi, bukan data aktual.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="fitur">
        <div className="section-header">
          <h2 className="section-title">Fitur Unggulan</h2>
          <p className="section-subtitle">SPARK bekerja seperti asisten profesional untuk Anda.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card featured">
            <div className="feature-icon" style={{ width: '64px', height: '64px', minWidth: '64px' }}>
              <ScanLine size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Scan Nota Otomatis (OCR)</h3>
              <p>Foto nota belanja Anda, dan SPARK akan mengubahnya menjadi data transaksi terstruktur dalam hitungan detik. Tidak perlu input manual lagi.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <AlertTriangle size={24} />
            </div>
            <h3>AI Agent Proaktif</h3>
            <p>Sistem mendeteksi masalah seperti stok menipis atau pengeluaran melonjak dan memberi rekomendasi tanpa perlu Anda minta.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 size={24} />
            </div>
            <h3>Pembukuan Otomatis</h3>
            <p>Income, expense, profit/loss, dan cash flow — semuanya terhitung secara otomatis dengan akurasi 100%.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Package size={24} />
            </div>
            <h3>Rekomendasi Stok</h3>
            <p>Ketahui secara pasti kapan dan berapa banyak barang yang harus di-restock sebelum pelanggan Anda kehabisan.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle size={24} />
            </div>
            <h3>AI Business Consultant</h3>
            <p>Tanya langsung mengenai kondisi bisnis Anda seperti sedang chatting dengan konsultan profesional. Dijawab berdasarkan data aktual.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" id="cara-kerja">
        <div className="section-header">
          <h2 className="section-title">Cara Kerja SPARK</h2>
          <p className="section-subtitle">Mulai kelola bisnis dengan cerdas hanya dalam 4 langkah mudah.</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Setup Awal</h3>
            <p>Masukkan daftar produk dan harga</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>Scan Nota</h3>
            <p>Foto nota untuk catat transaksi</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>AI Analisis</h3>
            <p>SPARK membaca pola bisnis Anda</p>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <h3>Ambil Keputusan</h3>
            <p>Ikuti rekomendasi berbasis data</p>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="section" id="keunggulan">
        <div className="section-header">
          <h2 className="section-title">Nilai Lebih SPARK</h2>
        </div>
        <div className="advantages-grid">
          <div className="advantage-card">
            <ShieldCheck size={24} className="advantage-icon" />
            <div>
              <h4>Bukan sekadar pencatat</h4>
              <p>Ini adalah asisten bisnis yang aktif berpikir untuk kemajuan UMKM Anda.</p>
            </div>
          </div>
          <div className="advantage-card">
            <CheckCircle2 size={24} className="advantage-icon" />
            <div>
              <h4>Cocok untuk semua nota</h4>
              <p>Mendukung nota hasil cetak sistem (printed) maupun nota tulisan tangan.</p>
            </div>
          </div>
          <div className="advantage-card">
            <CheckCircle2 size={24} className="advantage-icon" />
            <div>
              <h4>Penjelasan yang Jelas</h4>
              <p>Setiap rekomendasi AI disertai dengan alasan logis yang mudah dipahami orang awam.</p>
            </div>
          </div>
          <div className="advantage-card">
            <ShieldCheck size={24} className="advantage-icon" />
            <div>
              <h4>Berbasis Data Aktual</h4>
              <p>Analisis yang diberikan murni dari data bisnis Anda, bukan jawaban template generik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Siap kelola bisnis dengan lebih cerdas?</h2>
        <Button variant="primary" onClick={() => navigate('/register')} style={{ fontSize: '1.125rem', padding: '16px 32px' }}>
          Daftar Sekarang — Gratis
        </Button>
        <p className="cta-note">Tidak perlu kartu kredit. Mulai dalam 2 menit.</p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="landing-logo" style={{ width: '32px', height: '32px' }}>
              <Zap size={16} />
            </div>
            SPARK
          </div>
          <div className="footer-links">
            <button onClick={() => scrollToSection('fitur')} className="footer-link" style={{ background: 'none', border: 'none' }}>Fitur</button>
            <button onClick={() => scrollToSection('cara-kerja')} className="footer-link" style={{ background: 'none', border: 'none' }}>Cara Kerja</button>
            <button onClick={() => scrollToSection('keunggulan')} className="footer-link" style={{ background: 'none', border: 'none' }}>Tentang</button>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Kontak</a>
          </div>
          <div className="footer-copyright">
            &copy; 2024 SPARK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
