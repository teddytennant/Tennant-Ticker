export interface Stock {
  symbol: string;
  name: string;
  price: {
    current: number;
    change: number;
    changePercent: number;
  };
  metrics: {
    marketCap: string;
    peRatio: number | null;
    avgVolume: number;
  };
  volatilityScore: number;
  headlines: NewsItem[];
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