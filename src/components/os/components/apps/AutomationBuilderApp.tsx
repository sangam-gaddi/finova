'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Zap, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  triggerValue: string;
  action: string;
  actionDetail: string;
  enabled: boolean;
  lastRun?: string;
}

const MOCK_AUTOMATIONS: Automation[] = [
  { id: '1', name: 'Auto-save surplus', trigger: 'Balance exceeds', triggerValue: '$5,000', action: 'Send alert', actionDetail: 'Move $500 to savings', enabled: true, lastRun: '2 days ago' },
  { id: '2', name: 'Budget Alert', trigger: 'Spending exceeds', triggerValue: '80% of budget', action: 'Send alert', actionDetail: 'Push budget warning notification', enabled: true, lastRun: '5 hours ago' },
  { id: '3', name: 'SIP Reminder', trigger: 'Date equals', triggerValue: '1st of month', action: 'Create reminder', actionDetail: 'Monthly contribution due', enabled: false },
];

const TRIGGER_TYPES = ['Balance exceeds', 'Spending exceeds', 'Date equals', 'Income received', 'Category spend exceeds'];
const ACTION_TYPES = ['Send alert', 'Transfer funds', 'Create reminder', 'Start SIP', 'Suggest investment'];

const TRIGGER_COLORS: Record<string, string> = {
  'Balance exceeds': '#3b82f6',
  'Spending exceeds': '#f43f5e',
  'Date equals': '#8b5cf6',
  'Income received': '#10b981',
  'Category spend exceeds': '#f59e0b',
};

export function AutomationBuilderApp() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newName, setNewName] = useState('');
  const [triggerType, setTriggerType] = useState(TRIGGER_TYPES[0]);
  const [triggerValue, setTriggerValue] = useState('');
  const [actionType, setActionType] = useState(ACTION_TYPES[0]);
  const [actionDetail, setActionDetail] = useState('');

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  const createAutomation = () => {
    if (!newName.trim() || !triggerValue.trim()) return;
    setAutomations(prev => [{
      id: Date.now().toString(),
      name: newName,
      trigger: triggerType,
      triggerValue,
      action: actionType,
      actionDetail: actionDetail || actionType,
      enabled: true,
    }, ...prev]);
    setShowBuilder(false);
    setNewName(''); setTriggerValue(''); setActionDetail('');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm tracking-widest uppercase">Automations</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
            {automations.filter(a => a.enabled).length} active
          </span>
        </div>
        <button
          onClick={() => setShowBuilder(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            showBuilder ? 'bg-white/10 text-white/60' : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}
        >
          {showBuilder ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> New Rule</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* Builder form */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-white/[0.04] border border-amber-400/20 space-y-3"
            >
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder-white/20 focus:outline-none focus:border-amber-400/40"
                placeholder="Rule name, e.g. Auto-invest surplus"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">IF (Trigger)</div>
                  <select
                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/40"
                    value={triggerType}
                    onChange={e => setTriggerType(e.target.value)}
                  >
                    {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">THEN (Action)</div>
                  <select
                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/40"
                    value={actionType}
                    onChange={e => setActionType(e.target.value)}
                  >
                    {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs placeholder-white/20 focus:outline-none focus:border-amber-400/40"
                  placeholder="Trigger value, e.g. $5,000"
                  value={triggerValue}
                  onChange={e => setTriggerValue(e.target.value)}
                />
                <input
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs placeholder-white/20 focus:outline-none focus:border-amber-400/40"
                  placeholder="Action detail, e.g. Move to savings"
                  value={actionDetail}
                  onChange={e => setActionDetail(e.target.value)}
                />
              </div>
              <button
                onClick={createAutomation}
                disabled={!newName.trim() || !triggerValue.trim()}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-bold transition-colors"
              >
                Create Rule
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Automation cards */}
        {automations.map((a, i) => {
          const color = TRIGGER_COLORS[a.trigger] || '#8b5cf6';
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
              style={{ borderLeftWidth: 3, borderLeftColor: a.enabled ? color : 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold truncate">{a.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${
                    a.enabled ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/10'
                  }`}>
                    {a.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="text-[11px] text-white/40 leading-relaxed">
                  <span className="text-white/25">IF</span>{' '}
                  <span style={{ color }}>{a.trigger} {a.triggerValue}</span>
                  <span className="text-white/25 mx-1">→</span>
                  <span className="text-white/25">THEN</span>{' '}
                  <span className="text-emerald-400">{a.actionDetail}</span>
                </div>
                {a.lastRun && <div className="text-[10px] text-white/20 mt-1">Last run: {a.lastRun}</div>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleAutomation(a.id)} className="text-white/40 hover:text-white transition-colors">
                  {a.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteAutomation(a.id)} className="text-white/20 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {automations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-white/20">
            <Zap className="w-8 h-8" />
            <p className="text-sm">No automation rules yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
