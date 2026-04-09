'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { PlusCircle, Loader2, AlertTriangle, X, CalendarIcon, Trash2 } from 'lucide-react';
import { useFinova } from './FinovaContext';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Education', 'Rent', 'Investment', 'Other', 'Custom'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment Return', 'Gift', 'Refund', 'Other', 'Custom'];
const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

const MOODS = [
  { value: 'needed', label: '✅ Needed', color: '#10d98a', bg: 'rgba(16,217,138,0.1)', border: 'rgba(16,217,138,0.25)' },
  { value: 'neutral', label: '😐 Neutral', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  { value: 'impulse', label: '🔥 Impulse', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
];

const CAT_ICONS: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Utilities: '💡',
  Entertainment: '🎮', Health: '💊', Education: '📚', Rent: '🏠',
  Investment: '📈', Other: '📦', Custom: '✨',
  Salary: '💼', Freelance: '💻', 'Investment Return': '💸', Gift: '🎁', Refund: '🔄'
};
const CAT_COLORS: Record<string, string> = {
  Food: '#10d98a', Transport: '#3b82f6', Shopping: '#8b5cf6', Utilities: '#f59e0b',
  Entertainment: '#ec4899', Health: '#06b6d4', Education: '#f97316', Rent: '#ef4444',
  Investment: '#a855f7', Other: '#6b7280', Custom: '#a855f7',
  Salary: '#22c55e', Freelance: '#3b82f6', 'Investment Return': '#10d98a', Gift: '#ec4899', Refund: '#f59e0b'
};


export function Track() {
  const { invalidateTransactions, transactionVersion } = useFinova();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budgetAlert, setBudgetAlert] = useState<any>(null);
  const [nlInput, setNlInput] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [customCategory, setCustomCategory] = useState('');

  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'expense' as 'income' | 'expense',
    mood: 'neutral',
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions?limit=50');
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // Re-fetch when transactionVersion changes (triggered by other apps or self)
  useEffect(() => { fetchTransactions(); }, [transactionVersion, fetchTransactions]);

  // Auto-categorize
  useEffect(() => {
    if (!form.description || form.description.length < 3) return;
    const timer = setTimeout(async () => {
      setCatLoading(true);
      try {
        const res = await fetch('/api/ai/categorize', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: form.description }),
        });
        const data = await res.json();
        if (data.category) setForm((f) => ({ ...f, category: data.category }));
      } catch {} finally { setCatLoading(false); }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.description]);

  const parseNL = async () => {
    if (!nlInput.trim()) return;
    setNlLoading(true);
    const amountMatch = nlInput.match(/[₹$]?\s*(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const desc = nlInput.replace(/[₹$]?\s*\d+(?:\.\d+)?/g, '').replace(/\b(on|for|paid|spent|bought|at)\b/gi, '').trim() || nlInput;
    setForm((f) => ({ ...f, amount: amount.toString(), description: desc, type: 'expense' }));
    setShowForm(true);
    setNlInput('');
    setNlLoading(false);
    try {
      const res = await fetch('/api/ai/categorize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: desc }) });
      const data = await res.json();
      if (data.category) setForm((f) => ({ ...f, category: data.category }));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setSaving(true);
    try {
      const finalCategory = form.category === 'Custom' ? (customCategory.trim() || 'Custom') : form.category;
      const submitData = { ...form, category: finalCategory };

      const res = await fetch('/api/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.budgetAlert) setBudgetAlert(data.budgetAlert);
      setShowForm(false);
      setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10), type: 'expense', mood: 'neutral' });
      setCustomCategory('');
      // Notify all apps
      invalidateTransactions();
    } catch (err: any) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      // Optimistically update
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      invalidateTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const filtered = filterCat === 'All' ? transactions : transactions.filter((t) => t.category === filterCat);

  return (
    <div className="track-root">
      {/* Budget Alert */}
      <AnimatePresence>
        {budgetAlert && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="track-alert">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Budget Warning:</strong> <strong>{budgetAlert.utilization}%</strong> of {budgetAlert.category} used (₹{budgetAlert.spent?.toLocaleString('en-IN')} / ₹{budgetAlert.limit?.toLocaleString('en-IN')})</span>
            <button onClick={() => setBudgetAlert(null)} className="ml-auto opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="track-header">
        <div>
          <h2 className="track-title">💸 TRACK</h2>
          <p className="track-sub">{total} transactions</p>
        </div>
        <div className="track-summary-chips">
          <span className="track-chip track-chip-income">↑ ₹{totalIncome.toLocaleString('en-IN')}</span>
          <span className="track-chip track-chip-expense">↓ ₹{totalExpenses.toLocaleString('en-IN')}</span>
          <span className={`track-chip ${totalIncome - totalExpenses >= 0 ? 'track-chip-income' : 'track-chip-expense'}`}>
            Net: ₹{Math.abs(totalIncome - totalExpenses).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Quick Add */}
      <div className="track-nl-row">
        <div className="track-nl-input-wrap">
          <input
            placeholder='Quick add: "₹450 on Swiggy" or "salary 50000"'
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && parseNL()}
            className="track-nl-input"
          />
          <button onClick={parseNL} disabled={nlLoading} className="track-nl-btn">
            {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse →'}
          </button>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="track-add-btn">
          <PlusCircle className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Manual Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="track-form"
          >
            {/* Type toggle */}
            <div className="track-type-toggle">
              {(['expense', 'income'] as const).map((t) => (
                <button key={t} type="button" onClick={() => {
                  setForm((f) => ({ ...f, type: t, category: t === 'expense' ? 'Food' : 'Salary' }));
                  setCustomCategory('');
                }}
                  className={`track-type-btn ${form.type === t ? (t === 'expense' ? 'track-type-btn--expense' : 'track-type-btn--income') : ''}`}>
                  {t === 'expense' ? '⬇️ Expense' : '⬆️ Income'}
                </button>
              ))}
            </div>

            <div className="track-form-row">
              <div className="track-form-field">
                <label>Amount (₹) *</label>
                <input type="number" placeholder="0" value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required className="track-input" min="0" step="0.01" />
              </div>
              <div className="track-form-field">
                <label className="track-label-ai">{catLoading ? '🤖 Detecting...' : 'Category'}</label>
                {form.category === 'Custom' ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Custom category format..." 
                      value={customCategory} 
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="track-input"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setForm(f => ({...f, category: f.type === 'expense' ? 'Food' : 'Salary'}));
                        setCustomCategory('');
                      }}
                      style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.625rem', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-white" />
                    </button>
                  </div>
                ) : (
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="track-input track-select">
                    {(form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => <option key={c} value={c}>{CAT_ICONS[c] || '✨'} {c}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="track-form-field">
              <label>Description <span className="track-optional">(optional)</span></label>
              <input type="text" placeholder="e.g. Swiggy dinner, Amazon order..." value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="track-input" />
            </div>

            <div className="track-form-row">
              <div className="track-form-field">
                <label>Date</label>
                <div className="track-date-wrap">
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="track-input track-date-input" />
                  <CalendarIcon className="track-date-icon w-3.5 h-3.5" />
                </div>
              </div>
              <div className="track-form-field">
                <label>Spending Mood</label>
                <div className="track-mood-row">
                  {MOODS.map((m) => (
                    <button key={m.value} type="button" onClick={() => setForm((f) => ({ ...f, mood: m.value }))}
                      className="track-mood-btn"
                      style={form.mood === m.value ? { background: m.bg, borderColor: m.border, color: m.color } : {}}>
                      <span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="track-save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '✓ Save Transaction'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Category Filter Pills */}
      <div className="track-filter-row">
        {['All', ...ALL_CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`track-filter-pill ${filterCat === cat ? 'track-filter-pill--active' : ''}`}
            style={filterCat === cat && cat !== 'All' ? { borderColor: (CAT_COLORS[cat] || '#a855f7') + '66', color: CAT_COLORS[cat] || '#a855f7' } : {}}>
            {cat !== 'All' ? (CAT_ICONS[cat] || '✨') : ''} {cat}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="track-table-wrap">
        {loading ? (
          <div className="track-loading"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="track-empty">
            <p className="text-4xl mb-3">{filterCat !== 'All' ? CAT_ICONS[filterCat] : '💸'}</p>
            <p className="text-gray-500 text-sm">
              {filterCat !== 'All' ? `No ${filterCat} transactions yet` : 'No transactions yet. Add your first one above!'}
            </p>
          </div>
        ) : (
          <LayoutGroup>
            {filtered.map((tx) => (
              <motion.div key={tx._id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="track-row">
                <div className="track-row-cat-dot" style={{ background: CAT_COLORS[tx.category] || '#a855f7' }} />
                <span className="track-row-icon">{CAT_ICONS[tx.category] || '✨'}</span>
                <div className="track-row-info">
                  <span className="track-row-desc">{tx.description || tx.category}</span>
                  <div className="track-row-tags">
                    <span className="track-tag" style={{ color: CAT_COLORS[tx.category] || '#a855f7' }}>{tx.category}</span>
                    <span className="track-tag-sep">·</span>
                    <span className="track-tag">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
                <div className="track-row-right" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <span className={`track-row-amount ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="track-row-mood" title={tx.mood}>
                      {tx.mood === 'needed' ? '✅' : tx.mood === 'impulse' ? '🔥' : '😐'}
                    </span>
                  </div>
                  <button onClick={(e) => handleDelete(tx._id, e)} className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete transaction">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}
