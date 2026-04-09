// @ts-nocheck
'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import AuthPanel from '../../components/auth/AuthPanel';
import Footer from '../../components/Footer/Footer';
import Transition from '../../components/transition/Transition';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis } from 'lenis/react';
import './Home.css';
import '../../app/finova-home.css';

const STATS = [
  { label: 'Transactions Tracked', value: '2.4M+' },
  { label: 'Users Saved Avg', value: '₹18K/mo' },
  { label: 'AI Predictions Accurate', value: '94%' },
  { label: 'Net Worth Managed', value: '₹50Cr+' },
];

const FEATURES = [
  {
    icon: '💸',
    name: 'TRACK',
    desc: 'Log every rupee. Natural language, SMS paste, or voice. Never miss a transaction.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: '📊',
    name: 'SAVE',
    desc: 'Real-time analytics. Health score. Weekly burn rate. See your financial truth.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '📈',
    name: 'INVEST',
    desc: 'Bloomberg-style terminal. SIP calculator. AI-curated screeners. Grow intelligently.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: '🛡️',
    name: 'GUARD',
    desc: 'Budget enforcer that fires alerts at 80% utilization. Be warned. Not surprised.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '📷',
    name: 'SCAN',
    desc: 'Snap a receipt. AI extracts the data. Confirm and done. Friction = zero.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: '🧠',
    name: 'VORA AI',
    desc: 'Your Goldman Sachs-level analyst. Context-aware. Blunt. Your real numbers, not generic advice.',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    icon: '🌐',
    name: 'WEB3',
    desc: 'MetaMask integration. ERC-20 balances. AAVE yield. Your on-chain wealth, unified.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: '🎛️',
    name: 'COMMAND',
    desc: 'Live net worth widget on your desktop. Top budget bars. Always visible, always real.',
    gradient: 'from-slate-500 to-gray-600',
  },
];

const Home = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Stat counters
    gsap.fromTo('.finova-stat', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.finova-stats', start: 'top 80%' }
    });

    // Feature cards
    gsap.fromTo('.finova-feature-card', { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.finova-features-grid', start: 'top 75%' }
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <ReactLenis root>
      <div className="page finova-home">

        {/* HERO */}
        <section className="hero">
          <div className="hero-img">
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            >
              <source src="/toxic-hero.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="hero-header">
            <h1>
              FINOVA <br /> OS
            </h1>
            <p>Shaping the Future of Personal Finance with AI</p>
            <div className="stickers">
              <img src="/stickers.png" alt="" />
            </div>
            <button>
              <Link href="/os">Enter FINOVA OS</Link>
            </button>
          </div>

          <div className="news-article">
            <div className="news-article-title">
              <p className="primary">
                AI Finance Advisors Surge: <br /> Smarter Budgets, Better Returns
              </p>
            </div>
            <div className="news-article-info">
              <p>7.1.2024</p>
              <p>Finance</p>
            </div>
          </div>
        </section>

        {/* LOGIN / SIGNUP */}
        <section className="finova-auth-section">
          <div className="finova-auth-section-inner">
            <div className="finova-auth-section-copy">
              <h2 className="finova-section-title">Login or Create Your Account</h2>
              <p className="finova-section-sub">
                Jump into FINOVA OS with your existing account or create a new one in under a minute.
              </p>
            </div>
            <div className="finova-auth-standalone">
              <AuthPanel />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="finova-stats">
          {STATS.map((s) => (
            <div key={s.label} className="finova-stat">
              <span className="finova-stat-value">{s.value}</span>
              <span className="finova-stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* APPS GRID */}
        <section className="finova-features-section">
          <div className="finova-features-header">
            <h2 className="finova-section-title">8 Apps. One OS.</h2>
            <p className="finova-section-sub">
              Every tool you need to master your money, running inside a windowed desktop your bank doesn't have.
            </p>
          </div>
          <div className="finova-features-grid">
            {FEATURES.map((f) => (
              <div key={f.name} className="finova-feature-card">
                <div className={`finova-feature-icon bg-gradient-to-br ${f.gradient}`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="finova-feature-name">{f.name}</h3>
                <p className="finova-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TERMINAL SECTION */}
        <section className="finova-terminal-section">
          <div className="finova-terminal-left">
            <h2 className="finova-section-title">Built for the 1% who care about <span className="finova-gradient-text">where every rupee goes.</span></h2>
            <p className="finova-section-sub">
              Most people check their bank app once a month and feel vague anxiety. FINOVA users know their savings rate, their impulse spend %, their net worth trajectory — in real time.
            </p>
            <Link href="/os" className="finova-cta-primary">
              Enter FINOVA OS →
            </Link>
          </div>
          <div className="finova-terminal-card">
            <div className="finova-terminal-bar">
              <span className="finova-dot red" /><span className="finova-dot yellow" /><span className="finova-dot green" />
              <span className="finova-terminal-title">VORA Financial Advisor</span>
            </div>
            <div className="finova-terminal-body">
              <div className="finova-chat-msg finova-chat-vora">
                <span className="finova-chat-label">VORA</span>
                <p>Your savings rate this month is 31% — well above the 20% healthy threshold. However, you've spent ₹4,200 on impulse purchases, which is 14% of your total spend. I'd recommend routing ₹2,000 of that into your emergency fund.</p>
              </div>
              <div className="finova-chat-msg finova-chat-user">
                <span className="finova-chat-label">You</span>
                <p>What's my best investment move right now?</p>
              </div>
              <div className="finova-chat-msg finova-chat-vora">
                <span className="finova-chat-label">VORA</span>
                <p>Given your moderate risk profile and ₹52,000 surplus this quarter: 60% Nifty 50 index funds via SIP, 30% in a liquid fund for 6-month emergency coverage, 10% in curated small-cap growth plays. Want me to simulate the 5-year projection?</p>
              </div>
              <div className="finova-chat-cursor" />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Transition(Home);
