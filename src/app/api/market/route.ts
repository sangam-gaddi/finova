import { NextRequest, NextResponse } from 'next/server';

// CoinGecko coin IDs for Indian context
const CRYPTO_IDS = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin',
  'ripple', 'cardano', 'polkadot', 'avalanche-2',
  'matic-network', 'chainlink',
];

// Yahoo Finance symbols for Indian + US stocks
const STOCK_SYMBOLS = [
  '^NSEI',          // Nifty 50
  '^BSESN',         // Sensex
  'RELIANCE.NS',    // Reliance
  'TCS.NS',         // TCS
  'INFY.NS',        // Infosys
  'HDFCBANK.NS',    // HDFC Bank
  'ICICIBANK.NS',   // ICICI Bank
  'WIPRO.NS',       // Wipro
  'BAJFINANCE.NS',  // Bajaj Finance
  'ADANIENT.NS',    // Adani Enterprises
];

// Cache to avoid hammering APIs
let cryptoCache: { data: any[]; ts: number } | null = null;
let stockCache: { data: any[]; ts: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchCrypto() {
  if (cryptoCache && Date.now() - cryptoCache.ts < CACHE_TTL) {
    return cryptoCache.data;
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  const ids = CRYPTO_IDS.join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;

  const res = await fetch(url, {
    headers: apiKey ? { 'x-cg-demo-api-key': apiKey } : {},
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json();

  const formatted = data.map((coin: any) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change: parseFloat((coin.price_change_percentage_24h || 0).toFixed(2)),
    marketCap: coin.market_cap,
    volume: coin.total_volume,
    image: coin.image,
    type: 'crypto' as const,
    id: coin.id,
  }));

  cryptoCache = { data: formatted, ts: Date.now() };
  return formatted;
}

async function fetchStocks() {
  if (stockCache && Date.now() - stockCache.ts < CACHE_TTL) {
    return stockCache.data;
  }

  // Use yahoo-finance2
  const yahooFinance = (await import('yahoo-finance2')).default;

  const results = await Promise.allSettled(
    STOCK_SYMBOLS.map(async (symbol) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote: any = await yahooFinance.quote(symbol);
        return {
          symbol: (quote.symbol || symbol) as string,
          name: (quote.shortName || quote.symbol || symbol) as string,
          price: (quote.regularMarketPrice || 0) as number,
          change: parseFloat(((quote.regularMarketChangePercent || 0) as number).toFixed(2)),
          volume: (quote.regularMarketVolume || 0) as number,
          marketCap: (quote.marketCap || 0) as number,
          type: (symbol.startsWith('^') ? 'index' : 'stock') as 'index' | 'stock',
        };
      } catch {
        return null;
      }
    })
  );

  const formatted = results
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<any>).value);

  stockCache = { data: formatted, ts: Date.now() };
  return formatted;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all'; // 'crypto' | 'stocks' | 'all'

  try {
    let cryptoData: any[] = [];
    let stockData: any[] = [];

    if (type === 'crypto' || type === 'all') {
      try {
        cryptoData = await fetchCrypto();
      } catch (e) {
        console.error('CoinGecko error:', e);
        // Fallback mock
        cryptoData = [
          { symbol: 'BTC', name: 'Bitcoin', price: 7234500, change: 2.45, type: 'crypto', image: null },
          { symbol: 'ETH', name: 'Ethereum', price: 498750, change: 1.18, type: 'crypto', image: null },
          { symbol: 'SOL', name: 'Solana', price: 14250, change: -1.87, type: 'crypto', image: null },
        ];
      }
    }

    if (type === 'stocks' || type === 'all') {
      try {
        stockData = await fetchStocks();
      } catch (e) {
        console.error('Yahoo Finance error:', e);
        // Fallback mock
        stockData = [
          { symbol: '^NSEI', name: 'Nifty 50', price: 24850, change: 1.24, type: 'index' },
          { symbol: '^BSESN', name: 'BSE Sensex', price: 82150, change: 0.98, type: 'index' },
          { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2954, change: -0.45, type: 'stock' },
          { symbol: 'TCS.NS', name: 'TCS', price: 4120, change: 0.72, type: 'stock' },
          { symbol: 'INFY.NS', name: 'Infosys', price: 1842, change: 2.31, type: 'stock' },
        ];
      }
    }

    return NextResponse.json({
      crypto: cryptoData,
      stocks: stockData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
