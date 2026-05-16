import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useBusinessStore from '../../stores/businessStore';
import { formatCurrency } from '../../utils/formatters';
import './DashboardChart.css';

export default function DashboardChart() {
  const [dataType, setDataType] = useState('pendapatan'); // pendapatan, pengeluaran, keuntungan
  const [period, setPeriod] = useState('7d'); // 7d, 1m, 1y

  const { chartData, fetchChartData, chartDataLoading } = useBusinessStore();

  useEffect(() => {
    fetchChartData(period);
  }, [period, fetchChartData]);

  const { color, dataKey, labelTitle } = useMemo(() => {
    if (dataType === 'pengeluaran') {
      return { color: '#F87171', dataKey: 'expense', labelTitle: 'Pengeluaran' };
    }
    if (dataType === 'keuntungan') {
      return { color: '#34D399', dataKey: 'profit', labelTitle: 'Keuntungan' };
    }
    return { color: '#22D3EE', dataKey: 'income', labelTitle: 'Pendapatan' };
  }, [dataType]);

  const periodLabel = useMemo(() => {
    if (period === '1y') return '1 Tahun Terakhir';
    if (period === '1m') return '1 Bulan Terakhir';
    if (period === '1d') return 'Hari Ini';
    return '7 Hari Terakhir';
  }, [period]);

  const formattedData = useMemo(() => {
    if (!chartData) return [];
    return chartData.map(item => {
      // Format label for display
      let displayLabel = item.label;
      if (period === '7d' || period === '1m') {
        const d = new Date(item.label);
        displayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      } else if (period === '1y') {
        const d = new Date(item.label + '-01'); // it's YYYY-MM
        displayLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      } else if (period === '1d') {
        // label is already 'HH:00'
        displayLabel = item.label;
      }
      return {
        ...item,
        displayLabel,
      };
    });
  }, [chartData, period]);

  const isEmpty = formattedData.length === 0 || formattedData.every(d => d[dataKey] === 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dashboard-chart-tooltip">
          <div className="dashboard-chart-tooltip-label">{label}</div>
          <div className="dashboard-chart-tooltip-value" style={{ color: payload[0].fill }}>
            {formatCurrency(payload[0].value)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-chart-container animate-fade-in">
      <div className="dashboard-chart-header">
        <h3 className="dashboard-chart-title">
          {labelTitle} — {periodLabel}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div className="dashboard-chart-toggles">
            <button 
              className={`dashboard-chart-toggle-btn ${dataType === 'pendapatan' ? 'active' : ''}`}
              onClick={() => setDataType('pendapatan')}
            >
              Pendapatan
            </button>
            <button 
              className={`dashboard-chart-toggle-btn ${dataType === 'pengeluaran' ? 'active' : ''}`}
              onClick={() => setDataType('pengeluaran')}
            >
              Pengeluaran
            </button>
            <button 
              className={`dashboard-chart-toggle-btn ${dataType === 'keuntungan' ? 'active' : ''}`}
              onClick={() => setDataType('keuntungan')}
            >
              Keuntungan
            </button>
          </div>
          <div className="dashboard-chart-toggles">
            <button 
              className={`dashboard-chart-toggle-btn ${period === '1d' ? 'active' : ''}`}
              onClick={() => setPeriod('1d')}
            >
              1 Hari
            </button>
            <button 
              className={`dashboard-chart-toggle-btn ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
            >
              7 Hari
            </button>
            <button 
              className={`dashboard-chart-toggle-btn ${period === '1m' ? 'active' : ''}`}
              onClick={() => setPeriod('1m')}
            >
              1 Bulan
            </button>
            <button 
              className={`dashboard-chart-toggle-btn ${period === '1y' ? 'active' : ''}`}
              onClick={() => setPeriod('1y')}
            >
              1 Tahun
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-chart-body">
        {chartDataLoading ? (
          <div className="dashboard-chart-empty">Memuat data...</div>
        ) : isEmpty ? (
          <div className="dashboard-chart-empty">Belum ada data untuk periode ini</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="displayLabel" 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                tickFormatter={(val) => {
                  if (val >= 1000000) return `Rp ${(val / 1000000).toLocaleString('id-ID')} Jt`;
                  if (val >= 1000) return `Rp ${(val / 1000).toLocaleString('id-ID')} Rb`;
                  return `Rp ${val}`;
                }}
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[4, 4, 0, 0]} 
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
