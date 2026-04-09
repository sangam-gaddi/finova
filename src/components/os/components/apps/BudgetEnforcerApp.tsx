'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Save, Sliders } from 'lucide-react';
import { useFinova } from './FinovaContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Education', 'Rent'] as const;

const CAT_COLORS: Record<string, string> = {
  Food: '#10d98a', Transport: '#3b82f6', Shopping: '#8b5cf6', Utilities: '#f59e0b',
  Entertainment: '#ec4899', Health: '#06b6d4', Education: '#f97316', Rent: '#ef4444',
};

interface Budget { _id?: string; category: string; limit: number; }
interface SpendingMap { [category: string]: number; }

export function BudgetEnforcerApp({ owner }: { owner?: string }) {
  const { budgetVersion, analyticsVersion, invalidateBudgets } = useFinova();
  const [budgets, setBudgets] = useState<Budget[]>(CATEGORIES.map((c) => ({ category: c, limit: 5000 })));
  const [spending, setSpending] = useState<SpendingMap>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Re-fetch whenever transactions are added (via FinovaContext) or budget changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, analyticsRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/analytics/summary'),
        ]);
        const budgetsData = await budgetsRes.json();
        const analyticsData = await analyticsRes.json();

        if (budgetsData.budgets && budgetsData.budgets.length > 0) {
          const merged = CATEGORIES.map((cat) => {
            const found = budgetsData.budgets.find((b: Budget) => b.category === cat);
            return found || { category: cat, limit: 5000 };
          });
          setBudgets(merged);
        }

        if (analyticsData.categoryBreakdown) {
          const map: SpendingMap = {};
          analyticsData.categoryBreakdown.forEach((c: any) => { map[c.name] = c.value; });
          setSpending(map);
        }
      } catch {}
    };
    fetchData();
  }, [budgetVersion, analyticsVersion]);

  const updateLimit = (index: number, value: number) => {
    setBudgets((prev) => prev.map((b, i) => i === index ? { ...b, limit: value } : b));
  };

  const saveBudgets = async () => {
    setSaving(true);
    try {
      await Promise.all(
        budgets.map((b) =>
          fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: b.category, limit: b.limit }),
          })
        )
      );
      setSaved(true);
      invalidateBudgets();
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="budget-root">
      <div className="budget-header">
        <div>
          <h2 className="budget-title">🛡️ Budget Enforcer</h2>
          <p className="budget-sub">Set limits. Get warned at 80%. Never overspend blindly.</p>
        </div>
        <button onClick={saveBudgets} disabled={saving} className="budget-save-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✓ Saved!' : <><Save className="w-4 h-4" /> Save All</>}
        </button>
      </div>

      <div className="budget-list">
        {budgets.map((budget, i) => {
          const spent = spending[budget.category] || 0;
          const utilization = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
          const clampedUtil = Math.min(100, utilization);
          const isWarning = utilization >= 80;
          const isOver = utilization >= 100;
          const color = CAT_COLORS[budget.category] || '#6b7280';

          return (
            <div key={budget.category} className="budget-item">
              <div className="budget-item-header">
                <div className="budget-item-left">
                  <div className="budget-cat-dot" style={{ background: color }} />
                  <span className="budget-cat-name">{budget.category}</span>
                  {isWarning && !isOver && (
                    <span className="budget-badge budget-badge--warn">⚠️ {Math.round(utilization)}%</span>
                  )}
                  {isOver && (
                    <span className="budget-badge budget-badge--over">🚨 OVER</span>
                  )}
                </div>
                <div className="budget-item-right">
                  <span className={`budget-spent ${isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-gray-400'}`}>
                    ₹{spent.toLocaleString('en-IN')}
                  </span>
                  <span className="budget-limit-label">/ ₹{budget.limit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="budget-bar-track">
                <motion.div
                  className="budget-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${clampedUtil}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    background: isOver
                      ? '#ef4444'
                      : isWarning
                        ? `linear-gradient(90deg, ${color}, #f59e0b)`
                        : color,
                    boxShadow: isWarning ? `0 0 8px ${isOver ? '#ef4444' : '#f59e0b'}44` : undefined,
                  }}
                />
              </div>

              {/* Slider */}
              <div className="budget-slider-row">
                <Sliders className="w-3 h-3 text-gray-600" />
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={budget.limit}
                  onChange={(e) => updateLimit(i, parseInt(e.target.value))}
                  className="budget-slider"
                  style={{ '--accent': color } as any}
                />
                <input
                  type="number"
                  value={budget.limit}
                  onChange={(e) => updateLimit(i, parseInt(e.target.value) || 0)}
                  className="budget-limit-input"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
