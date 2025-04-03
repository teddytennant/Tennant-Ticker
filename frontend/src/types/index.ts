export interface Stock {
  symbol: string;
  name: string;
  price: {
    current: number;
    change: number;
    changePercent: number;
  };
  metrics: {
    marketCap: string | null; // Allow null for marketCap
    peRatio: number | null;
    avgVolume: number | null; // Allow null for avgVolume
    eps?: number | null;
    beta?: number | null;
    dividend?: number | null;
    dividendYield?: number | null;
  };
  technicalIndicators?: {
    rsi: number | null;
    macd: number | null;
    sma50: number | null;
    sma200: number | null;
  };
  volatilityScore: number;
  headlines: NewsItem[];
  newsSummary?: string;
  historicalData?: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  sentiment?: 'positive' | 'negative' | 'neutral';
  holdings?: {
    quantity: number;
    averagePrice?: number;
  };
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}
