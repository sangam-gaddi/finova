'use client';
/**
 * FinovaContext — Shared financial state & event bus
 * All FINOVA apps communicate through this context.
 * When TRACK saves → emits 'transaction:added' → SAVE auto-refreshes analytics
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  healthScore: number;
  healthStatus: 'green' | 'amber' | 'red';
  monthlyIncome: number;
}

export interface Transaction {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  mood: string;
  aiNote?: string;
}

interface FinovaState {
  // Auth
  user: any | null;
  // Transactions (cached)
  transactions: Transaction[];
  transactionVersion: number; // increment to trigger re-fetches
  // Analytics (cached)
  summary: FinancialSummary | null;
  categoryBreakdown: any[];
  analyticsVersion: number;
  // Budgets
  budgetVersion: number;
  // Loading
  isLoadingTransactions: boolean;
  isLoadingAnalytics: boolean;
}

interface FinovaContextType extends FinovaState {
  // Triggers
  invalidateTransactions: () => void;
  invalidateAnalytics: () => void;
  invalidateBudgets: () => void;
  invalidateAll: () => void;
  // Setters
  setTransactions: (txns: Transaction[]) => void;
  setSummary: (s: FinancialSummary) => void;
  setCategoryBreakdown: (c: any[]) => void;
  setUser: (u: any) => void;
  setIsLoadingTransactions: (v: boolean) => void;
  setIsLoadingAnalytics: (v: boolean) => void;
}

const FinovaContext = createContext<FinovaContextType | undefined>(undefined);

export function FinovaProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionVersion, setTransactionVersion] = useState(0);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [analyticsVersion, setAnalyticsVersion] = useState(0);
  const [budgetVersion, setBudgetVersion] = useState(0);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const invalidateTransactions = useCallback(() => {
    setTransactionVersion((v) => v + 1);
    // Analytics depend on transactions — invalidate both
    setAnalyticsVersion((v) => v + 1);
  }, []);

  const invalidateAnalytics = useCallback(() => {
    setAnalyticsVersion((v) => v + 1);
  }, []);

  const invalidateBudgets = useCallback(() => {
    setBudgetVersion((v) => v + 1);
  }, []);

  const invalidateAll = useCallback(() => {
    setTransactionVersion((v) => v + 1);
    setAnalyticsVersion((v) => v + 1);
    setBudgetVersion((v) => v + 1);
  }, []);

  return (
    <FinovaContext.Provider value={{
      user, setUser,
      transactions, setTransactions,
      transactionVersion,
      summary, setSummary,
      categoryBreakdown, setCategoryBreakdown,
      analyticsVersion,
      budgetVersion,
      isLoadingTransactions, setIsLoadingTransactions,
      isLoadingAnalytics, setIsLoadingAnalytics,
      invalidateTransactions,
      invalidateAnalytics,
      invalidateBudgets,
      invalidateAll,
    }}>
      {children}
    </FinovaContext.Provider>
  );
}

export function useFinova() {
  const ctx = useContext(FinovaContext);
  if (!ctx) throw new Error('useFinova must be used within FinovaProvider');
  return ctx;
}
