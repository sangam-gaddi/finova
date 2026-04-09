import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// OpenRouter vision models — cascading fallback
const VISION_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-4-26b-a4b-it:free',
];

const RECEIPT_PROMPT = `You are a receipt OCR expert. Analyze this receipt image and extract the following information in VALID JSON format only. Do not include any text outside the JSON object.

Return exactly this structure:
{
  "merchantName": "store/restaurant name or null",
  "totalAmount": 999.99,
  "date": "YYYY-MM-DD or null",
  "category": "one of: Food, Transport, Shopping, Utilities, Entertainment, Health, Education, Rent, Investment, Other",
  "currency": "INR",
  "items": [
    {"name": "item name", "price": 99.99}
  ],
  "taxAmount": 0,
  "confidence": 0.95
}

Rules:
- totalAmount must be a NUMBER (float), not a string
- If you cannot see the total clearly, estimate from items or return null
- date must be in YYYY-MM-DD format
- items array can be empty [] if not visible
- confidence is 0-1 float representing how confident you are
- Return ONLY the JSON, no markdown, no explanation`;

async function callVisionModel(base64Image: string, mimeType: string, model: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'FINOVA Receipt Scanner',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RECEIPT_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          ],
        },
      ],
      max_tokens: 600,
      temperature: 0.1, // Low temp for accurate extraction
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${model} failed: ${res.status} — ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

function extractJSON(text: string): any {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Try extracting JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1].trim()); } catch {}
  }

  // Try finding { ... } block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch {}
  }

  throw new Error('Could not parse JSON from response');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: `Unsupported image type: ${imageFile.type}. Use JPEG, PNG, or WebP.` }, { status: 400 });
    }

    // File size check (10MB max)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type;

    let rawText = '';
    let usedModel = '';
    let lastError = '';

    // Try vision models in order
    for (const model of VISION_MODELS) {
      try {
        rawText = await callVisionModel(base64, mimeType, model);
        if (rawText) {
          usedModel = model;
          break;
        }
      } catch (e: any) {
        lastError = e.message || String(e);
        console.warn(`Receipt scanner: ${model} failed —`, lastError.slice(0, 100));
        continue;
      }
    }

    if (!rawText) {
      console.error('All vision models failed. Last error:', lastError);
      return NextResponse.json({
        error: 'Vision AI unavailable. All models failed. Try again or add manually.',
        details: lastError,
      }, { status: 503 });
    }

    // Parse the JSON response
    let receipt;
    try {
      receipt = extractJSON(rawText);
    } catch (parseErr) {
      console.error('Failed to parse vision response:', rawText);
      return NextResponse.json({
        error: 'Could not parse receipt data. Try a clearer photo.',
        rawResponse: rawText.slice(0, 200),
      }, { status: 422 });
    }

    // Normalize and validate
    const normalized = {
      merchantName: receipt.merchantName || null,
      totalAmount: typeof receipt.totalAmount === 'number' ? receipt.totalAmount : parseFloat(receipt.totalAmount) || null,
      date: receipt.date || new Date().toISOString().slice(0, 10),
      category: receipt.category || 'Other',
      items: Array.isArray(receipt.items) ? receipt.items : [],
      taxAmount: receipt.taxAmount || 0,
      confidence: receipt.confidence || 0.8,
      currency: receipt.currency || 'INR',
    };

    return NextResponse.json({
      receipt: normalized,
      model: usedModel,
      success: true,
    });
  } catch (error: any) {
    console.error('Vision error:', error);
    return NextResponse.json({ error: `Extraction failed: ${error.message}` }, { status: 500 });
  }
}
