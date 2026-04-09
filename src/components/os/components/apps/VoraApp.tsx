'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Bot, User, Mic, MicOff, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'How am I doing financially this month?',
  'Where am I overspending?',
  'Give me my top 3 money moves right now.',
  'Should I invest or save more?',
];

export function VoraApp({ owner }: { owner?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello. I'm VORA — your AI financial advisor with access to your actual spending data. What do you want to know about your money?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/vora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message || 'VORA is offline right now. Check your AI connection.' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection failed. Check your AI configuration.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="vora-root">
      {/* Header */}
      <div className="vora-header">
        <div className="vora-header-left">
          <div className="vora-avatar">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="vora-title">VORA</h2>
            <p className="vora-sub">Financial Intelligence · Connected to your data</p>
          </div>
        </div>
        <div className="vora-status">
          <span className="vora-status-dot" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="vora-starters">
          {STARTER_PROMPTS.map((p) => (
            <button key={p} onClick={() => send(p)} className="vora-starter-chip">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="vora-messages">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`vora-msg-wrapper ${msg.role === 'user' ? 'vora-msg-user' : 'vora-msg-assistant'}`}
            >
              <div className="vora-msg-icon">
                {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-blue-400" />}
              </div>
              <div className={`vora-bubble ${msg.role === 'user' ? 'vora-bubble-user' : 'vora-bubble-assistant'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="vora-msg-wrapper vora-msg-assistant">
            <div className="vora-msg-icon"><Bot className="w-4 h-4 text-emerald-400" /></div>
            <div className="vora-bubble vora-bubble-assistant vora-thinking">
              <span /><span /><span />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="vora-input-row">
        <button onClick={toggleVoice} className={`vora-voice-btn ${listening ? 'vora-voice-btn--active' : ''}`}>
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask VORA anything about your finances..."
          className="vora-input"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="vora-send-btn">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
