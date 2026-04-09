'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, IndianRupee, TrendingUp, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type Tab = 'login' | 'signup';

const RISK_OPTIONS = [
  { value: 'low', label: 'Conservative', desc: 'FDs & Bonds', color: 'text-blue-400' },
  { value: 'moderate', label: 'Balanced', desc: 'Mutual Funds', color: 'text-yellow-400' },
  { value: 'high', label: 'Aggressive', desc: 'Stocks & Crypto', color: 'text-red-400' },
];

export default function AuthPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [riskProfile, setRiskProfile] = useState('moderate');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('finova-user', JSON.stringify(data.user));
        sessionStorage.setItem('finova-name', data.user.name || 'User');
      }
      router.push('/os');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) { setError('Please enter a valid monthly income'); return; }

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, monthlyIncome: parseFloat(monthlyIncome), riskProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('finova-user', JSON.stringify(data.user));
        sessionStorage.setItem('finova-name', data.user.name || 'User');
      }
      router.push('/os');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="finova-auth-panel">
      {/* Tabs */}
      <div className="auth-tabs">
        {(['login', 'signup'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            className={`auth-tab ${tab === t ? 'auth-tab--active' : ''}`}
          >
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'login' ? (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleLogin}
            className="auth-form"
          >
            <div className="auth-field">
              <Mail className="auth-field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <Lock className="auth-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <span className="flex items-center justify-center gap-2">
                  Launch FINOVA <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSignup}
            className="auth-form"
          >
            <div className="auth-field">
              <User className="auth-field-icon" />
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="auth-input" />
            </div>

            <div className="auth-field">
              <Mail className="auth-field-icon" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            </div>

            <div className="auth-field">
              <Lock className="auth-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <PasswordStrengthMeter password={password} />

            <div className="auth-field">
              <IndianRupee className="auth-field-icon" />
              <input
                type="number"
                placeholder="Monthly income (₹)"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
                min="0"
                className="auth-input"
              />
            </div>

            {/* Risk Profile */}
            <div className="auth-risk-section">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-gray-400">Risk Appetite</span>
              </div>
              <div className="auth-risk-options">
                {RISK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRiskProfile(opt.value)}
                    className={`auth-risk-btn ${riskProfile === opt.value ? 'auth-risk-btn--active' : ''}`}
                  >
                    <span className={`text-xs font-bold ${opt.color}`}>{opt.label}</span>
                    <span className="text-xs text-gray-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                <span className="flex items-center justify-center gap-2">
                  Start Your FINOVA <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
