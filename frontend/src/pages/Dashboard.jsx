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
import DashboardChart from '../components/ui/DashboardChart';
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
          icon={<Wallet size={20} />}
        />
        <MetricCard
          label="Pengeluaran Hari Ini"
          value={dailySummary?.expense || 0}
          trend={0}
          trendLabel=""
          variant="expense"
          icon={<ShoppingCart size={20} />}
        />
        <MetricCard
          label="Profit Bersih"
          value={dailySummary?.profit || 0}
          trend={0}
          trendLabel=""
          variant="profit"
          icon={<TrendingUp size={20} />}
        />
      </div>

      <DashboardChart />

      <section className="dashboard__section animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">💡 AI Insights</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && <span className="dashboard__section-count">{unreadCount} baru</span>}
            <Button variant="ghost" size="sm" onClick={triggerInsights} loading={insightsLoading}>
              <RefreshCw size={14} className={insightsLoading ? 'animate-spin' : ''} /> <span style={{ marginLeft: '6px' }}>Cek</span>
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
          <EmptyState title="Belum ada insight" text="Klik 'Cek' untuk menjalankan analisis AI pada datamu." icon={<RefreshCw size={32} />} />
        )}
      </section>

      <section className="dashboard__section animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Transaksi Terbaru</h2>
          <span className="dashboard__section-count">{transactions.length} total</span>
        </div>
        <div className="dashboard__transactions stagger-children">
          {transactions.length === 0 ? (
            <EmptyState title="Belum ada transaksi" text="Mulai scan nota atau tambahkan manual." icon={<ShoppingCart size={32} />} />
          ) : (
            transactions.slice(0, 6).map((txn) => (
              <div key={txn.id} className="txn-row" id={`txn-${txn.id}`}>
                <div className="txn-row__left">
                  <span className="txn-row__name">
                    {txn.items?.[0]?.product_name || 'Transaksi'}
                    {txn.items?.length > 1 && ` +${txn.items.length - 1} lainnya`}
                  </span>
                  <div className="txn-row__meta">
                    <Badge variant={txn.transaction_type === 'sale' ? 'success' : 'danger'} dot>
                      {txn.transaction_type === 'sale' ? 'Penjualan' : 'Pembelian'}
                    </Badge>
                    <span>{formatDate(txn.transaction_date)}</span>
                    {txn.source === 'ocr' && <Badge variant="primary">AI OCR</Badge>}
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
