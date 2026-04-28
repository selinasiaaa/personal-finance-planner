import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'chart.js/auto'
import './DashboardPage.css'

// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════
const DashboardPage = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    trend: '—', sp500: '—', topPerformer: '—', performance: '—', riskLevel: '—', riskSub: '', news: [],
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const trendChartRef  = useRef(null);
  const sectorChartRef = useRef(null);
  const trendChartInst  = useRef(null);
  const sectorChartInst = useRef(null);

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);
  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market-insights');
      if (!res.ok) throw new Error('Failed to fetch market insights');
      const payload = await res.json();
      const data = payload.data ?? payload;
      setDashboardData({
        trend: data.trend ?? '—',
        sp500: data.sp500 ?? data.performance ?? '—',
        topPerformer: data.topPerformer ?? '—',
        performance: data.performance ?? '—',
        riskLevel: data.riskLevel ?? '—',
        riskSub: data.riskSub ?? '',
        news: Array.isArray(data.news) ? data.news : [],
      });
      setLastUpdated(new Date());
      renderCharts();
    } catch (err) {
      console.error('Error loading market insights:', err);
    } finally { setLoading(false); }
  };

  const renderCharts = () => {
    if (trendChartInst.current) trendChartInst.current.destroy();
    if (trendChartRef.current) {
      trendChartInst.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], datasets: [{ data: [4200,4350,4205,4510,4630,4585,4790,4875], borderColor: '#3b6eff', backgroundColor: 'rgba(59,110,255,0.10)', pointBackgroundColor: '#3b6eff', pointRadius: 5, borderWidth: 2.5, tension: 0.35, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 6000, ticks: { stepSize: 1500, color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } }, x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } } } },
      });
    }
    if (sectorChartInst.current) sectorChartInst.current.destroy();
    if (sectorChartRef.current) {
      sectorChartInst.current = new Chart(sectorChartRef.current, {
        type: 'bar',
        data: { labels: ['Tech','Health','Finance','Energy','Industrial','Consumer'], datasets: [{ data: [15,8,5,-2,6,4], backgroundColor: '#3b6eff', borderRadius: 8, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: -5, max: 15, ticks: { stepSize: 5, color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } }, x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { display: false }, border: { display: false } } } },
      });
    }
  };

  const formatDate = d => d?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) ?? '—';

  const iconBox = (bg, color) => ({ width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.55rem', flexShrink: 0, background: bg, color });

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Market Insights Dashboard</h1>
          <p className="page-subtitle">Real-time market data and analysis</p>
        </div>
        <button type="button" className="btn-primary-action" onClick={loadInsights} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i>{loading ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Market Trend',   value: dashboardData.trend,        sub: dashboardData.sp500,       bg: '#eaf7ef', color: '#2563eb', icon: 'bi-graph-up-arrow',     emphasis: 'summary-emphasis-green' },
          { label: 'Top Performer',  value: dashboardData.topPerformer, sub: dashboardData.performance, bg: '#e9efff', color: '#2563eb', icon: 'bi-award',               emphasis: 'summary-emphasis-green' },
          { label: 'Risk Level',     value: dashboardData.riskLevel,    sub: dashboardData.riskSub,     bg: '#fff2e8', color: '#2563eb', icon: 'bi-exclamation-triangle', emphasis: 'summary-emphasis-dark'  },
        ].map(({ label, value, sub, bg, color, icon, emphasis }) => (
          <div key={label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '22px 24px', boxShadow: '0 2px 16px rgba(59,110,255,.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p className="summary-label">{label}</p>
              <h2 className={`summary-value ${emphasis}`}>{value}</h2>
              <p className="summary-sub">{sub}</p>
            </div>
            <div style={iconBox(bg, color)}><i className={`bi ${icon}`}></i></div>
          </div>
        ))}
      </div>

      {/* API Summary Panel */}
      <div className="dashboard-panel" style={{ marginBottom: '20px' }}>
        <div className="insight-card-head">
          <h3 className="section-title-sm mb-0">API-driven Summary</h3>
          <span className="insight-pill">{dashboardData.riskLevel} Risk</span>
        </div>
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-item">
            <span className="insight-label">Trend Signal</span>
            <div className="dashboard-inline-highlight"><i className="bi bi-arrow-up-right"></i><span>{dashboardData.trend}</span></div>
          </div>
          <div className="dashboard-summary-item">
            <span className="insight-label">Top Performing Segment</span>
            <strong className="insight-value">{dashboardData.topPerformer}</strong>
          </div>
          <div className="dashboard-summary-item">
            <span className="insight-label">Performance Reading</span>
            <strong className="insight-value dashboard-performance-value">{dashboardData.performance.replace(' Growth', '')}</strong>
          </div>
        </div>
        <div className="dashboard-updated-row">
          <i className="bi bi-clock-history"></i><span>Last Updated: {formatDate(lastUpdated)}</span>
        </div>
      </div>

      {/* Financial News */}
      <div style={{ marginBottom: '20px' }}>
        <div className="dashboard-section-header dashboard-section-header--stacked">
          <h2 className="dashboard-section-title">Financial News</h2>
          <p className="page-subtitle">Latest updates from trusted sources</p>
        </div>
        <div className="dashboard-news-list">
          {dashboardData.news.length > 0 ? dashboardData.news.map((n, i) => (
            <a
              key={`${n.title ?? 'news'}-${i}`}
              className="news-card"
              href={n.link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
            >
              <div className={`news-thumb news-thumb--${(i % 3) + 1}`}></div>
              <div className="news-content">
                <h3 className="news-title">{n.title ?? 'Market update'}</h3>
                <div className="news-meta">
                  <span className="news-source">{n.source ?? 'Market Desk'}</span><span>&bull;</span>
                  <span>{n.timeLabel ?? n.time ?? 'Recent'}</span><span>&bull;</span>
                  <span className="news-link">
                    <i className="bi bi-box-arrow-up-right"></i>
                  </span>
                </div>
              </div>
            </a>
          )) : (
            <div className="dashboard-panel" style={{ padding: '16px 18px' }}>
              No market news available yet.
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginBottom: '20px' }}>
        <div className="dashboard-section-header dashboard-section-header--stacked">
          <h2 className="dashboard-section-title">Market Trends Visualization</h2>
          <p className="page-subtitle">Historical performance and sector analysis</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="dashboard-panel chart-panel">
            <h3 className="section-title-sm">S&amp;P 500 Trend (2026)</h3>
            <div className="chart-wrapper"><canvas ref={trendChartRef}></canvas></div>
          </div>
          <div className="dashboard-panel chart-panel">
            <h3 className="section-title-sm">Sector Performance Comparison</h3>
            <div className="chart-wrapper"><canvas ref={sectorChartRef}></canvas></div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="dashboard-panel">
        <div className="dashboard-section-header mb-0">
          <h2 className="dashboard-section-title">Next Actions &amp; Recommendations</h2>
          <p className="page-subtitle">Suggested actions based on current market conditions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginTop: '18px' }}>
          {[
            { icon: 'bi-check-circle',    title: 'Stay Aggressive',             text: 'Market trend is bullish. Consider increasing exposure to growth stocks.',                                                    warn: false },
            { icon: 'bi-bar-chart-line',  title: 'Compare Portfolio Allocation', text: 'Review your current allocation against top-performing sectors.',                                                             warn: true  },
            { icon: 'bi-shield-check',    title: 'Review Risk Level',            text: 'Current market volatility is moderate. Assess your risk tolerance before investing.',                                         warn: false },
            { icon: 'bi-exclamation-circle', title: 'Monitor Tech Sector',      text: `Tech Stocks showing strong performance (${dashboardData.performance.replace(' Growth','')}). Watch for pullback opportunities.`, warn: true  },
          ].map((r, i) => (
            <div key={i} className={`recommendation-item${r.warn ? ' warning' : ''}`}>
              <div className="recommendation-icon"><i className={`bi ${r.icon}`}></i></div>
              <div><h4>{r.title}</h4><p>{r.text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════

export default DashboardPage
