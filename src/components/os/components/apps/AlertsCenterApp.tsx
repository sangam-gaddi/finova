'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { AlertTriangle, Bell, Check, Info, Filter } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  read: boolean;
  time: string;
}

const MOCK_ALERTS: Alert[] = [
  { id: '1', title: 'Budget Warning', message: 'Shopping spend is at 82% of monthly limit', severity: 'high', type: 'budget', read: false, time: '5 min ago' },
  { id: '2', title: 'Bill Due Tomorrow', message: 'Electricity bill ₹1,800 due tomorrow', severity: 'medium', type: 'bill', read: false, time: '1 hour ago' },
  { id: '3', title: 'Market Update', message: 'S&P 500 crossed 5,400 — up 0.8% today', severity: 'low', type: 'market', read: false, time: '2 hours ago' },
  { id: '4', title: 'SIP Executed', message: 'Monthly contribution of $200 processed successfully', severity: 'low', type: 'investment', read: true, time: 'Yesterday' },
  { id: '5', title: 'Unusual Spending', message: 'Travel expenses 3x higher than usual this week', severity: 'high', type: 'spending', read: true, time: '2 days ago' },
  { id: '6', title: 'Account Synced', message: 'FINOVA transactions synced successfully', severity: 'low', type: 'system', read: true, time: '3 days ago' },
];

const SEVERITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f43f5e',
  critical: '#dc2626',
};

const FILTER_TAGS = ['all', 'unread', 'budget', 'bill', 'market', 'spending'];

export function AlertsCenterApp() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState('all');

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

  const filtered = filter === 'all' ? alerts
    : filter === 'unread' ? alerts.filter(a => !a.read)
    : alerts.filter(a => a.type === filter);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-sm tracking-widest uppercase">Alerts</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-emerald-400 transition-colors"
        >
          <Check className="w-3 h-3" /> Mark all read
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto shrink-0 border-b border-white/5">
        {FILTER_TAGS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] px-3 py-1 rounded-full border whitespace-nowrap transition-all font-medium capitalize ${
              filter === f
                ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                : 'border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence>
          {filtered.map((alert, i) => {
            const color = SEVERITY_COLORS[alert.severity];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: alert.read ? 0.55 : 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(alert.id)}
                className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors"
                style={{ borderLeftWidth: 3, borderLeftColor: color }}
              >
                {alert.severity === 'high' || alert.severity === 'critical'
                  ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                  : <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{alert.title}</span>
                    <span className="text-[10px] text-white/30 shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{alert.message}</p>
                </div>
                {!alert.read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 animate-pulse" style={{ background: color }} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-white/20">
            <Bell className="w-8 h-8" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
