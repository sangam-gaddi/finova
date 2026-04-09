'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface DecodedResult {
  raw: string;
  decoded: string;
  merchant: string;
  method: string;
  category: string;
  confidence: number;
}

const EXAMPLES = [
  'VNRBANK/UPI/VIKAS/45/55',
  'SBIUPI/AMAZON/4587',
  'HDFCNEFT/SAL/JAN2026',
  'ICICIUPI/SWIGGY/ORD123',
  'PAYTMUPI/PHONEPE/RECHARGE',
];

export function TransactionDecoderApp() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<DecodedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const decode = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/vora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Decode this bank transaction description and return ONLY valid JSON (no markdown): "${text}"
Return: { "decoded": "human readable description", "merchant": "merchant name", "method": "UPI/NEFT/IMPS/Card/etc", "category": "Food/Shopping/Transport/etc", "confidence": 0.0-1.0 }`,
          }],
        }),
      });
      const data = await res.json();
      let parsed: Partial<DecodedResult> = {};
      try {
        const raw = (data.message || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(raw);
      } catch {
        parsed = { decoded: data.message || text, merchant: 'Unknown', method: 'Unknown', category: 'Uncategorized', confidence: 0.5 };
      }
      setResults(prev => [{
        raw: text,
        decoded: parsed.decoded || text,
        merchant: parsed.merchant || 'Unknown',
        method: parsed.method || 'Unknown',
        category: parsed.category || 'Uncategorized',
        confidence: parsed.confidence ?? 0.5,
      }, ...prev.slice(0, 9)]);
    } catch {
      setResults(prev => [{ raw: text, decoded: 'Decode failed – try again', merchant: 'Error', method: '-', category: '-', confidence: 0 }, ...prev.slice(0, 9)]);
    }
    setIsLoading(false);
    setInput('');
  };

  const handleBulk = () => {
    const lines = input.split('\n').filter(l => l.trim());
    lines.forEach((line, i) => setTimeout(() => decode(line), i * 600));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="font-bold text-sm tracking-widest uppercase">Transaction Decoder</span>
        <span className="text-[10px] text-white/30 ml-auto">Powered by VORA AI</span>
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-b border-white/5 shrink-0 space-y-2">
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm placeholder-white/20 focus:outline-none focus:border-amber-400/40 resize-none font-mono"
          placeholder={'VNRBANK/UPI/VIKAS/45/55\nSBIUPI/AMAZON/4587'}
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={() => decode(input)}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold transition-colors"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {isLoading ? 'Decoding…' : 'Decode'}
          </button>
          <button
            onClick={handleBulk}
            disabled={isLoading || !input.trim()}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-xs transition-colors disabled:opacity-40"
          >
            Bulk Decode
          </button>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => { setInput(ex); decode(ex); }}
              className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all font-mono"
            >
              {ex.slice(0, 22)}…
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence>
          {results.map((r, i) => (
            <motion.div
              key={`${r.raw}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="text-[10px] text-white/30 font-mono mb-1">{r.raw}</div>
              <div className="text-sm font-semibold text-white mb-2">{r.decoded}</div>
              <div className="grid grid-cols-3 gap-2 text-[11px] mb-2">
                <div>
                  <div className="text-white/30">Merchant</div>
                  <div className="text-white/70 font-medium">{r.merchant}</div>
                </div>
                <div>
                  <div className="text-white/30">Method</div>
                  <div className="text-blue-400 font-medium">{r.method}</div>
                </div>
                <div>
                  <div className="text-white/30">Category</div>
                  <div className="text-emerald-400 font-medium">{r.category}</div>
                </div>
              </div>
              {/* Confidence bar */}
              <div className="flex items-center gap-2">
                {r.confidence > 0.7
                  ? <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  : <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                }
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${r.confidence * 100}%`,
                      background: r.confidence > 0.7 ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
                <span className="text-[10px] text-white/30">{Math.round(r.confidence * 100)}%</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {results.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-white/20">
            <Search className="w-8 h-8" />
            <p className="text-sm">Paste a bank transaction code to decode it</p>
          </div>
        )}
      </div>
    </div>
  );
}
