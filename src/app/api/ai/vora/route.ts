import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Transaction } from '@/lib/db/models/Transaction';
import { User } from '@/lib/db/models/User';

// OpenRouter models — in priority order
const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/llama-nemotron-embed-vl-1b-v2:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
];

async function callOpenRouter(messages: any[], model: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'FINOVA VORA Financial AI',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 600,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${model} failed: ${res.status} — ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error(`Empty response from ${model}`);
  return content;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch user context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRaw = await (User as any).findById(session.userId).select('-password').lean();
    const user = userRaw || {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentTx = await Transaction.find({ userId: session.userId })
      .sort({ date: -1 })
      .limit(15)
      .lean() as any[];

    const monthlyTotals = await Transaction.aggregate([
      { $match: { userId: session.userId, date: { $gte: startOfMonth }, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const totalMonthIncome = await Transaction.aggregate([
      { $match: { userId: session.userId, date: { $gte: startOfMonth }, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthIncome = totalMonthIncome[0]?.total || user?.monthlyIncome || 0;
    const monthExpenses = monthlyTotals.reduce((acc: number, t: any) => acc + t.total, 0);

    const contextSummary = `
USER FINANCIAL PROFILE:
- Name: ${user?.name || 'User'}
- Monthly Income: ₹${(user?.monthlyIncome || 0).toLocaleString('en-IN')}
- Risk Profile: ${user?.riskProfile || 'moderate'}
- Currency: INR

THIS MONTH (${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}):
- Income so far: ₹${monthIncome.toLocaleString('en-IN')}
- Expenses so far: ₹${monthExpenses.toLocaleString('en-IN')}
- Remaining budget: ₹${(monthIncome - monthExpenses).toLocaleString('en-IN')}

TOP SPENDING CATEGORIES THIS MONTH:
${monthlyTotals.slice(0, 6).map((t: any) => `- ${t._id}: ₹${t.total.toLocaleString('en-IN')}`).join('\n') || '— No expense data yet —'}

LAST 15 TRANSACTIONS:
${recentTx.map((t: any) => `- ${t.description || t.category}: ₹${t.amount} [${t.category}][${t.type}][${t.mood || 'neutral'}] on ${new Date(t.date).toLocaleDateString('en-IN')}`).join('\n') || '— No transactions yet —'}
`;

    const systemPrompt = `You are VORA, FINOVA's AI financial advisor. You have access to the user's REAL financial data shown below. You are direct, data-driven, and actionable — like a Goldman Sachs analyst with warmth. Never give generic advice; always reference actual numbers from the user's data. Keep responses concise (3-5 sentences) unless asked for detail. Use ₹ for currency and Indian number formatting (lakhs/crores when appropriate).

${contextSummary}`;

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10), // last 10 messages for context window
    ];

    let response = '';
    let lastError = '';

    // Try OpenRouter models in order
    for (const model of OPENROUTER_MODELS) {
      try {
        response = await callOpenRouter(llmMessages, model);
        if (response) break;
      } catch (e: any) {
        lastError = e.message || String(e);
        console.warn(`VORA: ${model} failed —`, lastError.slice(0, 100));
        continue;
      }
    }

    // Ollama fallback
    if (!response && process.env.VORA_AGENT_URL) {
      try {
        const ollamaPrompt = llmMessages.map((m) =>
          `${m.role === 'system' ? 'System' : m.role === 'user' ? 'User' : 'VORA'}: ${m.content}`
        ).join('\n\n') + '\n\nVORA:';

        const ollamaRes = await fetch(`${process.env.VORA_AGENT_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.VORA_MODEL || 'qwen3:8b',
            prompt: ollamaPrompt,
            stream: false,
            options: { num_predict: 600, temperature: 0.7 },
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          response = ollamaData.response?.trim() || '';
        }
      } catch (e) {
        console.warn('Ollama fallback failed:', e);
      }
    }

    if (!response) {
      console.error('All VORA models failed. Last error:', lastError);
      response = "I'm having connectivity issues right now. All my AI models are temporarily unavailable. Please check your OpenRouter API key and try again in a moment.";
    }

    return NextResponse.json({ message: response, model: response ? 'ok' : 'fallback' });
  } catch (error) {
    console.error('VORA route error:', error);
    return NextResponse.json({ error: 'VORA failed to respond' }, { status: 500 });
  }
}
