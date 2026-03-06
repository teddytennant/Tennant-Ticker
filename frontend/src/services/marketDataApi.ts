import { getResearchResponse } from './researchApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export async function getMarketIndices(): Promise<MarketData[]> {
  const response = await fetch(`${API_BASE_URL}/api/market-indices`);
  if (!response.ok) {
    throw new Error(`Failed to fetch market indices: ${response.status}`);
  }
  return response.json();
}

export async function getTopMovers(): Promise<MarketData[]> {
  const response = await fetch(`${API_BASE_URL}/api/top-movers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top movers: ${response.status}`);
  }
  return response.json();
}

export async function getSectorPerformance(): Promise<
  Array<{ sector: string; performance: number; lastUpdated: string }>
> {
  const response = await fetch(`${API_BASE_URL}/api/sector-performance`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sector performance: ${response.status}`);
  }
  return response.json();
}

export async function getMarketNews(): Promise<string> {
  const summary = await getResearchResponse(
    'Give me a summary of the most important market news today.',
    'NEWS_SUMMARY'
  );
  return summary;
}
