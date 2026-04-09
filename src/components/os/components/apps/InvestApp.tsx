'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { gsap } from 'gsap';

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: 'crypto' | 'stock' | 'index';
  image?: string | null;
  volume?: number;
  marketCap?: number;
}

interface MarketData {
  crypto: MarketItem[];
  stocks: MarketItem[];
  updatedAt: string;
}

function SIPCalculator({ monthlyIncome }: { monthlyIncome: number }) {
  const [amount, setAmount] = useState(100);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [lumpSum, setLumpSum] = useState(0);

  const n = years * 12;
  const r = rate / 100 / 12;
  const sipFV = r > 0 ? amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : amount * n;
  const lumpFV = lumpSum * Math.pow(1 + rate / 100, years);
  const totalFV = sipFV + lumpFV;
  const totalInvested = amount * n + lumpSum;
  const totalGains = totalFV - totalInvested;
  const returnsMultiple = totalInvested > 0 ? (totalFV / totalInvested).toFixed(2) : '1.00';
  const sipBarPct = totalFV > 0 ? Math.round((sipFV / totalFV) * 100) : 50;

  const PRESETS = [
    { label: 'FD', rate: 7 },
    { label: 'S&P 500', rate: 10.5 },
    { label: 'Nasdaq', rate: 13.5 },
    { label: 'BTC Avg', rate: 40 },
  ];

  return (
    <div className="invest-sip-card">
      <h3 className="invest-section-title">💰 Wealth Simulator</h3>

      {/* Benchmark quick-select */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setRate(p.rate)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium ${
              rate === p.rate
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {p.label} ({p.rate}%)
          </button>
        ))}
      </div>

      <div className="invest-sip-inputs">
        <div className="invest-sip-field">
          <label>Initial Capital / Lump Sum ($)</label>
          <input
            type="number"
            value={lumpSum}
            onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value)))}
            className="invest-input"
            min="0"
            step="500"
            placeholder="0"
          />
        </div>

        <div className="invest-sip-field">
          <label>Monthly Contribution ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="invest-input"
            min="0"
            step="50"
          />
        </div>

        <div className="invest-sip-field">
          <label>Duration — <span className="text-blue-400 font-bold">{years} years</span></label>
          <input
            type="range" min="1" max="40" value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="invest-slider"
          />
        </div>

        <div className="invest-sip-field">
          <label>Expected Return — <span className="text-emerald-400 font-bold">{rate}% p.a.</span></label>
          <input
            type="range" min="1" max="60" step="0.5" value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="invest-slider"
          />
        </div>
      </div>

      {/* SIP vs Lump Sum visual bar */}
      <div className="mt-4 mb-3">
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>SIP Growth</span>
          <span>Lump Sum Growth</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${sipBarPct}%` }} />
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${100 - sipBarPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span className="text-emerald-400">${Math.round(sipFV).toLocaleString('en-US')}</span>
          <span className="text-blue-400">${Math.round(lumpFV).toLocaleString('en-US')}</span>
        </div>
      </div>

      <div className="invest-sip-result">
        <div className="invest-sip-metric">
          <span>Total Invested</span>
          <span className="text-gray-300 font-semibold">${totalInvested.toLocaleString('en-US')}</span>
        </div>
        <div className="invest-sip-metric">
          <span>Total Gains</span>
          <span className="text-emerald-400 font-bold">+${Math.round(totalGains).toLocaleString('en-US')}</span>
        </div>
        <div className="invest-sip-metric">
          <span>Returns Multiple</span>
          <span className="text-purple-400 font-bold">{returnsMultiple}x</span>
        </div>
        <div className="invest-sip-metric invest-sip-metric--total">
          <span>Final Corpus</span>
          <span className="text-white font-black text-lg">${Math.round(totalFV).toLocaleString('en-US')}</span>
        </div>
      </div>

      <div className="invest-sip-tip">
        <span>💡</span>
        <span>
          ${amount}/mo {lumpSum > 0 ? `+ $${lumpSum.toLocaleString()} lump sum ` : ''}
          for {years}yr at {rate}% = <strong>${Math.round(totalFV).toLocaleString('en-US')}</strong>
        </span>
      </div>
    </div>
  );
}

function AssetCard({ item, onClick }: { item: MarketItem; onClick?: () => void }) {
  const isUp = (item.change ?? 0) >= 0;

  const formatPrice = (p: number | null | undefined) => {
    const n = p ?? 0;
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(2)}B`;
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `$${n.toLocaleString('en-US')}`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="invest-asset-card"
      onClick={onClick}
    >
      <div className="invest-asset-header">
        <div className="invest-asset-left">
          {item.image ? (
            <img src={item.image} alt={item.symbol} className="invest-coin-img" />
          ) : (
            <div className={`invest-asset-dot ${item.type === 'index' ? 'bg-amber-500' : item.type === 'crypto' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          )}
          <div>
            <span className="invest-asset-symbol">{item.symbol.replace('.NS', '').replace('^', '')}</span>
            <span className="invest-asset-name">{item.name}</span>
          </div>
        </div>
        <span className={`invest-asset-change ${isUp ? 'invest-change-up' : 'invest-change-down'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(item.change)}%
        </span>
      </div>
      <div className="invest-asset-price">{formatPrice(item.price)}</div>
      {item.marketCap && item.marketCap > 0 && (
        <div className="invest-asset-mcap">
          MCap: ${(item.marketCap / 1000000000).toFixed(1)}B
        </div>
      )}
    </motion.div>
  );
}

function TickerTape({ items }: { items: MarketItem[] }) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!tickerRef.current || items.length === 0) return;
    animRef.current?.kill();
    animRef.current = gsap.to(tickerRef.current, {
      x: '-50%',
      duration: items.length * 3,
      ease: 'none',
      repeat: -1,
    });
    return () => { animRef.current?.kill(); };
  }, [items.length]);

  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className="invest-ticker-outer">
      <div className="invest-ticker-track" ref={tickerRef}>
        {doubled.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="invest-ticker-item">
            {item.image && <img src={item.image} alt={item.symbol} className="w-3 h-3 rounded-full" />}
            <span className="invest-ticker-symbol">{item.symbol.replace('.NS', '').replace('^', '')}</span>
            <span className="invest-ticker-price">
              {(() => {
                const p = item.price ?? 0;
                if (p >= 1000000000) return `$${(p / 1000000000).toFixed(2)}B`;
                if (p >= 1000000) return `$${(p / 1000000).toFixed(2)}M`;
                if (p >= 1000) return `$${p.toLocaleString('en-US')}`;
                return `$${p.toFixed(2)}`;
              })()}
            </span>
            <span className={`invest-ticker-change ${(item.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(item.change ?? 0) >= 0 ? '+' : ''}{(item.change ?? 0).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function InvestApp({ owner }: { owner?: string }) {
  const [view, setView] = useState<'stocks' | 'crypto' | 'sip' | 'advisor'>('stocks');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [risk, setRisk] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMarketData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/market?type=all');
      if (!res.ok) throw new Error('Market API failed');
      const data: MarketData = await res.json();
      setMarketData(data);
      setLastUpdate(new Date());
      setIsLive(true);
    } catch (e) {
      console.error('Market data error:', e);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user?.monthlyIncome) setMonthlyIncome(d.user.monthlyIncome);
    }).catch(() => {});

    // Auto-refresh every 60s
    refreshRef.current = setInterval(() => fetchMarketData(true), 60000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, []);

  const getAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/ai/vora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Give me a personalized 3-paragraph global investment strategy for a ${risk} risk profile investor looking at US equities (S&P 500, Nasdaq 100) and highly liquid Crypto. Include specific ETF and stock names (SPY, QQQ, TSLA, BTC) allocating their monthly contributions, and one actionable step to take this week. Be specific and direct.`
          }]
        }),
      });
      const data = await res.json();
      setAiAdvice(data.message || 'AI advice unavailable');
    } catch {
      setAiAdvice('Could not connect to VORA. Check your AI configuration.');
    } finally { setLoadingAdvice(false); }
  };

  const allTicker = [...(marketData?.stocks || []), ...(marketData?.crypto || [])];
  const displayData = view === 'crypto' ? (marketData?.crypto || []) : (marketData?.stocks || []);

  return (
    <div className="invest-root">
      {/* Live Ticker */}
      <TickerTape items={allTicker} />

      {/* Header */}
      <div className="invest-header">
        <div className="invest-header-left">
          <h2 className="invest-title">📈 INVEST</h2>
          <div className="invest-live-badge">
            {isLive ? (
              <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 text-xs">Live</span></>
            ) : (
              <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400 text-xs">Offline</span></>
            )}
            {lastUpdate && (
              <span className="text-gray-600 text-xs hidden md:inline">
                · {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="invest-header-right">
          <button onClick={() => fetchMarketData()} className="invest-refresh-btn" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="invest-tabs">
            {(['stocks', 'crypto', 'sip', 'advisor'] as const).map((t) => (
              <button key={t} onClick={() => setView(t)}
                className={`invest-tab ${view === t ? 'invest-tab--active' : ''}`}>
                {t === 'stocks' ? '🌎 Equities' : t === 'crypto' ? '₿ Crypto' : t === 'sip' ? '📐 Simulator' : '🧠 AI'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="invest-content">
        {(view === 'stocks' || view === 'crypto') && (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="invest-grid"
            >
              {loading ? (
                <div className="invest-loading">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                  <span className="text-sm text-gray-400">Fetching live market data...</span>
                </div>
              ) : displayData.length === 0 ? (
                <div className="invest-loading">
                  <span className="text-gray-500 text-sm">No data available. Check connection.</span>
                </div>
              ) : (
                displayData.map((item) => (
                  <AssetCard key={item.symbol} item={item} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {view === 'sip' && <SIPCalculator monthlyIncome={monthlyIncome} />}

        {view === 'advisor' && (
          <div className="invest-advisor">
            <div className="invest-risk-row">
              <span className="text-sm text-gray-400 mr-1">Risk Appetite:</span>
              {(['low', 'moderate', 'high'] as const).map((r) => (
                <button key={r} onClick={() => setRisk(r)}
                  className={`invest-risk-btn ${risk === r ? 'invest-risk-btn--active' : ''}`}>
                  {r === 'low' ? '🔵 Conservative' : r === 'moderate' ? '🟡 Balanced' : '🔴 Aggressive'}
                </button>
              ))}
            </div>

            <button onClick={getAIAdvice} disabled={loadingAdvice} className="invest-advice-btn">
              {loadingAdvice
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your profile...</>
                : '🧠 Generate AI Strategy'}
            </button>

            {aiAdvice && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="invest-advice-card">
                <div className="invest-advice-label">
                  VORA · {risk.toUpperCase()} RISK · {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
                <p className="invest-advice-text">{aiAdvice}</p>
              </motion.div>
            )}

            {!aiAdvice && !loadingAdvice && (
              <div className="invest-advisor-placeholder">
                <div className="text-4xl mb-3">🧠</div>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  Select your risk appetite and generate a personalized investment strategy based on your actual financial data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
