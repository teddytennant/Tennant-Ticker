import { StockQuote } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(`${API_BASE_URL}/api/quote/${encodeURIComponent(symbol)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}: ${response.status}`);
  }
  const data = await response.json();
  return {
    price: data.regularMarketPrice ?? 0,
    change: data.regularMarketChange ?? 0,
    changePercent: data.regularMarketChangePercent ?? 0,
    volume: data.regularMarketVolume ?? 0,
    symbol: data.symbol,
    name: data.shortName,
  } as StockQuote;
}

export async function getCompanyOverview(symbol: string): Promise<{
  marketCap: string;
  peRatio: number | null;
  avgVolume: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/quote/${encodeURIComponent(symbol)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch overview for ${symbol}: ${response.status}`);
  }
  const data = await response.json();
  return {
    marketCap: String(data.marketCap ?? '0'),
    peRatio: null,
    avgVolume: data.regularMarketVolume ?? 0,
  };
}

export async function getHistoricalData(
  symbol: string,
  timeframe: string = '1mo'
): Promise<Array<{ date: string; open: number | null; high: number | null; low: number | null; close: number | null; volume: number | null }>> {
  const periodMap: Record<string, string> = {
    '1d': '1d',
    '1w': '5d',
    '1m': '1mo',
    '3m': '3mo',
    '1y': '1y',
  };
  const period = periodMap[timeframe] || '1mo';

  const response = await fetch(
    `${API_BASE_URL}/api/historical/${encodeURIComponent(symbol)}?period=${period}&interval=1d`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data for ${symbol}: ${response.status}`);
  }
  const data = await response.json();

  if (Array.isArray(data)) {
    return data.map((point: Record<string, unknown>) => ({
      date: String(point.Date ?? ''),
      open: point.Open != null ? Number(point.Open) : null,
      high: point.High != null ? Number(point.High) : null,
      low: point.Low != null ? Number(point.Low) : null,
      close: point.Close != null ? Number(point.Close) : null,
      volume: point.Volume != null ? Number(point.Volume) : null,
    }));
  }

  return [];
}
