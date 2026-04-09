import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Education', 'Rent', 'Investment', 'Income', 'Other'];

async function callLLM(prompt: string): Promise<string> {
  // Try OpenRouter first (cloud, always available)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'FINOVA AI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 20,
        temperature: 0,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  } catch {}

  // Fallback: Ollama local
  try {
    const res = await fetch(`${process.env.VORA_AGENT_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.VORA_MODEL || 'qwen3:8b',
        prompt,
        stream: false,
        options: { num_predict: 20, temperature: 0 },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.response?.trim() || '';
    }
  } catch {}

  return '';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 });

    // Regex heuristics first (fast, free)
    const desc = description.toLowerCase();
    const heuristics: { keywords: string[]; category: string }[] = [
      { keywords: ['swiggy', 'zomato', 'food', 'eat', 'restaurant', 'lunch', 'dinner', 'breakfast', 'chai', 'coffee', 'groceries', 'bigbasket', 'zepto'], category: 'Food' },
      { keywords: ['uber', 'ola', 'petrol', 'metro', 'bus', 'train', 'flight', 'travel', 'rapido', 'auto', 'fuel'], category: 'Transport' },
      { keywords: ['amazon', 'flipkart', 'meesho', 'myntra', 'ajio', 'shop', 'clothes', 'shoes', 'electronics'], category: 'Shopping' },
      { keywords: ['electricity', 'bill', 'water', 'gas', 'wifi', 'internet', 'recharge', 'mobile', 'postpaid', 'dth'], category: 'Utilities' },
      { keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'movie', 'cinema', 'concert', 'gaming', 'entertainment', 'game'], category: 'Entertainment' },
      { keywords: ['hospital', 'medicine', 'pharmacy', 'doctor', 'health', 'gym', 'medical'], category: 'Health' },
      { keywords: ['course', 'college', 'fees', 'books', 'school', 'tuition', 'udemy', 'coursera', 'education'], category: 'Education' },
      { keywords: ['rent', 'pg', 'hostel', 'apartment', 'flat'], category: 'Rent' },
      { keywords: ['sip', 'mutual fund', 'stocks', 'crypto', 'invest', 'fd', 'ppf', 'zerodha', 'groww', 'upstox'], category: 'Investment' },
      { keywords: ['salary', 'income', 'freelance', 'payment received', 'transfer received', 'dividend', 'bonus'], category: 'Income' },
    ];

    for (const { keywords, category } of heuristics) {
      if (keywords.some((kw) => desc.includes(kw))) {
        return NextResponse.json({ category, confidence: 'high', source: 'heuristic' });
      }
    }

    // LLM fallback
    const prompt = `You are a financial transaction categorizer. Given this transaction description, respond with ONLY ONE WORD — the best matching category from this list: ${CATEGORIES.join(', ')}. 

Transaction: "${description}"

Category:`;

    const llmResponse = await callLLM(prompt);
    const matched = CATEGORIES.find((c) => llmResponse.toLowerCase().includes(c.toLowerCase()));

    return NextResponse.json({
      category: matched || 'Other',
      confidence: matched ? 'medium' : 'low',
      source: 'llm',
    });
  } catch (error) {
    return NextResponse.json({ category: 'Other', confidence: 'low', source: 'fallback' });
  }
}
