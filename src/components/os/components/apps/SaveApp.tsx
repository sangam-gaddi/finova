'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { gsap } from 'gsap';
import { useFinova } from './FinovaContext';

const COLORS = ['#10d98a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#a855f7', '#22c55e'];

function AnimatedStat({ value, prefix = '₹', suffix = '', className = '' }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(0);
  useEffect(() => {
    if (!ref.current || value === prevRef.current) return;
    gsap.fromTo({ val: prevRef.current }, { val: prevRef.current }, {
      val: value, duration: 1.2, ease: 'power2.out',
      onUpdate() { if (ref.current) ref.current.textContent = prefix + Math.round((this as any).targets()[0].val).toLocaleString('en-IN') + suffix; },
    });
    prevRef.current = value;
  }, [value, prefix, suffix]);
  return <span ref={ref} className={className}>{prefix}{value.toLocaleString('en-IN')}{suffix}</span>;
}

function HealthRing({ score, status }: { score: number; status: string }) {
  const color = status === 'green' ? '#10d98a' : status === 'amber' ? '#f59e0b' : '#ef4444';
  const label = { green: 'Healthy', amber: 'At Risk', red: 'Critical' }[status] || '';
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="save-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
        <text x="65" y="60" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900">{score}</text>
        <text x="65" y="78" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{label.toUpperCase()}</text>
      </svg>
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e8eaf0' },
};

export function Save() {
  const { analyticsVersion, invalidateAnalytics } = useFinova();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Re-fetch whenever analyticsVersion increments (from TrackApp saves, etc.)
  useEffect(() => { fetchData(); }, [analyticsVersion]);

  if (loading) return (
    <div className="save-loading">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      <p className="text-sm text-gray-500">Loading your analytics...</p>
    </div>
  );
  if (!data) return (
    <div className="save-loading">
      <AlertCircle className="w-6 h-6 text-red-400" />
      <p className="text-sm text-red-400">Failed to load analytics</p>
      <button onClick={() => fetchData()} className="text-xs text-blue-400 underline">Try again</button>
    </div>
  );

  const { summary, categoryBreakdown, weeklySpending, moodBreakdown } = data;
  const weeklyData = (weeklySpending || []).slice(-8).map((w: any, i: number) => ({
    week: `W${i + 1}`, amount: w.amount || 0,
  }));

  // Build radar chart data from category breakdown
  const radarData = (categoryBreakdown || []).slice(0, 6).map((c: any) => ({
    category: c.name.slice(0, 6), amount: c.value,
    fullMark: Math.max(...(categoryBreakdown || []).map((x: any) => x.value)) || 1,
  }));

  // Income vs expense bar data (monthly)
  const incomeExpenseData = [
    { name: 'Income', value: summary.totalIncome, fill: '#10d98a' },
    { name: 'Expenses', value: summary.totalExpenses, fill: '#ef4444' },
    { name: 'Savings', value: Math.max(0, summary.netSavings), fill: '#3b82f6' },
  ];

  return (
    <div className="save-root">
      {/* Header */}
      <div className="save-header-bar">
        <div>
          <h2 className="save-title">📊 SAVE</h2>
          <p className="save-sub">{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Analytics Dashboard'}</p>
        </div>
        <button onClick={() => fetchData()} className="save-refresh-btn" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="save-scroll">
        {/* KPI Row */}
        <div className="save-kpi-row">
          <div className="save-kpi-card save-kpi-income">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="save-kpi-label">Income</span>
            <AnimatedStat value={summary.totalIncome} className="save-kpi-value text-emerald-400" />
          </div>
          <div className="save-kpi-card save-kpi-expense">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="save-kpi-label">Expenses</span>
            <AnimatedStat value={summary.totalExpenses} className="save-kpi-value text-red-400" />
          </div>
          <div className={`save-kpi-card ${summary.netSavings >= 0 ? 'save-kpi-savings' : 'save-kpi-deficit'}`}>
            <ShieldCheck className={`w-4 h-4 ${summary.netSavings >= 0 ? 'text-blue-400' : 'text-amber-400'}`} />
            <span className="save-kpi-label">Net Savings</span>
            <AnimatedStat value={Math.abs(summary.netSavings)} prefix={summary.netSavings < 0 ? '-₹' : '₹'}
              className={`save-kpi-value ${summary.netSavings >= 0 ? 'text-blue-400' : 'text-amber-400'}`} />
          </div>
          <div className="save-kpi-card">
            <span className="save-kpi-label">Savings Rate</span>
            <span className={`save-kpi-value ${summary.savingsRate >= 20 ? 'text-emerald-400' : summary.savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
              {summary.savingsRate}%
            </span>
          </div>
        </div>

        {/* Health + Pie Row */}
        <div className="save-row-2">
          <div className="save-chart-card save-health-card">
            <p className="save-chart-title">Health Score</p>
            <HealthRing score={summary.healthScore} status={summary.healthStatus} />
            <div className="save-health-details">
              <div className="save-health-row">
                <span className="text-xs text-gray-500">Monthly Income</span>
                <span className="text-xs text-gray-300 font-bold">₹{summary.monthlyIncome?.toLocaleString('en-IN')}</span>
              </div>
              <div className="save-health-row">
                <span className="text-xs text-gray-500">Savings Rate</span>
                <span className={`text-xs font-bold ${summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>{summary.savingsRate}%</span>
              </div>
            </div>
            {/* Mood breakdown */}
            {moodBreakdown && moodBreakdown.length > 0 && (
              <div className="save-mood-chips">
                {moodBreakdown.map((m: any) => (
                  <div key={m.mood} className="save-mood-chip">
                    <span>{m.mood === 'needed' ? '✅' : m.mood === 'impulse' ? '🔥' : '😐'}</span>
                    <span className="text-xs text-gray-400">₹{m.total?.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-600">({m.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="save-chart-card">
            <p className="save-chart-title">Category Breakdown</p>
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      paddingAngle={3} dataKey="value">
                      {categoryBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']} {...CUSTOM_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="save-legend">
                  {categoryBreakdown.slice(0, 5).map((c: any, i: number) => (
                    <div key={c.name} className="save-legend-item">
                      <span className="save-legend-dot" style={{ background: COLORS[i] }} />
                      <span className="text-xs text-gray-400 flex-1">{c.name}</span>
                      <span className="text-xs text-white font-semibold">₹{c.value.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-gray-600 ml-1">({c.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="save-no-data">No expense data yet</div>
            )}
          </div>
        </div>

        {/* Weekly Area Chart */}
        <div className="save-chart-card save-wide-card">
          <p className="save-chart-title">Weekly Burn Rate</p>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']} {...CUSTOM_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#burnGrad)" strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="save-no-data">Add transactions to see trends</div>}
        </div>

        {/* Income vs Expenses Bar + Radar Row */}
        <div className="save-row-2">
          <div className="save-chart-card">
            <p className="save-chart-title">Income vs Expenses</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={incomeExpenseData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']} {...CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {incomeExpenseData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {radarData.length >= 3 ? (
            <div className="save-chart-card">
              <p className="save-chart-title">Spending Profile</p>
              <ResponsiveContainer width="100%" height={170}>
                <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Spending" dataKey="amount" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']} {...CUSTOM_TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="save-chart-card">
              <p className="save-chart-title">Spending Profile</p>
              <div className="save-no-data">
                <span className="text-2xl">📊</span>
                <span className="text-xs text-gray-500 text-center">Add 3+ categories<br />to see profile radar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
