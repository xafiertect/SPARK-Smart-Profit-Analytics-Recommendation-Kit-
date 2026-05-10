import { useEffect } from 'react';
import { TrendingUp, Wallet, ShoppingCart, RefreshCw } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import InsightCard from '../components/ui/InsightCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import useBusinessStore from '../stores/businessStore';
import useTransactionStore from '../stores/transactionStore';
import useAuthStore from '../stores/authStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const {
    insights, dailySummary, weeklySummary,
    fetchSummary, fetchInsights, triggerInsights,
    markInsightRead, dismissInsight,
    summaryLoading, insightsLoading,
  } = useBusinessStore();
  const { transactions, fetchTransactions, transactionsLoading } = useTransactionStore();

  useEffect(() => {
    fetchSummary();
    fetchInsights();
    fetchTransactions();
  }, [fetchSummary, fetchInsights, fetchTransactions]);

  const unreadCount = insights.filter((i) => !i.is_read).length;

  return (
    <div className="dashboard">
      <div className="dashboard__greeting animate-fade-in">
        <h1>Halo, {user?.business_name || 'SPARK'} 👋</h1>
        <p>{formatDate(new Date().toISOString(), 'long')}</p>
      </div>

      <div className="dashboard__metrics stagger-children">
        <MetricCard
          label="Pendapatan Hari Ini"
          value={dailySummary?.income || 0}
          trend={0}
          trendLabel=""
          variant="revenue"
          icon={<Wallet size={18} />}
        />
        <MetricCard
          label="Keuntungan Hari Ini"
          value={dailySummary?.profit || 0}
          trend={0}
          trendLabel=""
          variant="profit"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          label="Pengeluaran Hari Ini"
          value={dailySummary?.expense || 0}
          trend={0}
          trendLabel=""
          variant="expense"
          icon={<ShoppingCart size={18} />}
        />
      </div>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">💡 AI Insights</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && <span className="dashboard__section-count">{unreadCount} baru</span>}
            <Button variant="ghost" size="sm" onClick={triggerInsights} loading={insightsLoading}>
              <RefreshCw size={14} /> Cek
            </Button>
          </div>
        </div>
        {insights.length > 0 ? (
          <div className="dashboard__insights stagger-children">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={{
                  ...insight,
                  triggerType: insight.trigger_type,
                  isRead: insight.is_read,
                  text: insight.insight_text,
                  createdAt: insight.created_at,
                }}
                onDismiss={dismissInsight}
                onMarkRead={markInsightRead}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-md)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Belum ada insight. Klik "Cek" untuk menjalankan analisis AI.
          </div>
        )}
      </section>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Transaksi Terbaru</h2>
          <span className="dashboard__section-count">{transactions.length} total</span>
        </div>
        <div className="dashboard__transactions stagger-children">
          {transactions.length === 0 ? (
            <div style={{ padding: 'var(--space-md)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              Belum ada transaksi. Mulai scan nota atau tambahkan manual.
            </div>
          ) : (
            transactions.slice(0, 6).map((txn) => (
              <div key={txn.id} className="txn-row" id={`txn-${txn.id}`}>
                <div className="txn-row__left">
                  <span className="txn-row__name">
                    {txn.items?.[0]?.product_name || 'Transaksi'}
                    {txn.items?.length > 1 && ` +${txn.items.length - 1} lainnya`}
                  </span>
                  <div className="txn-row__meta">
                    <Badge variant={txn.transaction_type === 'sale' ? 'sale' : 'purchase'} dot>
                      {txn.transaction_type === 'sale' ? 'Penjualan' : 'Pembelian'}
                    </Badge>
                    <span>{formatDate(txn.transaction_date)}</span>
                    {txn.source === 'ocr' && <Badge variant="ai">OCR</Badge>}
                  </div>
                </div>
                <div className="txn-row__right">
                  <span className={`txn-row__amount txn-row__amount--${txn.transaction_type}`}>
                    {txn.transaction_type === 'sale' ? '+' : '-'}{formatCurrency(txn.total_amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
