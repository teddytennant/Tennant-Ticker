import axios from 'axios';
import { MarketData } from './marketDataApi';

const API_BASE_URL = 'http://localhost:3001/api';

// Interface for yfinance data
interface YFinanceQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
}

interface YFinanceHistoricalData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  'Adj Close': number;
}

// Get real-time quote data
export async function getQuote(symbol: string): Promise<YFinanceQuote | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/quote/${symbol}`);
    if (response.data.error) {
      console.error('Error fetching quote:', response.data.error);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error('Error executing API request:', error);
    return null;
  }
}

// Get historical data
export async function getHistoricalData(
  symbol: string,
  period: string = '1mo',
  interval: string = '1d'
): Promise<YFinanceHistoricalData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/historical/${symbol}`, {
      params: { period, interval }
    });
    if (response.data.error) {
      console.error('Error fetching historical data:', response.data.error);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error('Error executing API request:', error);
    return [];
  }
}

// Get company information
export async function getCompanyInfo(symbol: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/quote/${symbol}`);
    if (response.data.error) {
      console.error('Error fetching company info:', response.data.error);
      return null;
    }
    return {
      name: response.data.shortName,
      description: response.data.longBusinessSummary,
      sector: response.data.sector,
      industry: response.data.industry,
      marketCap: response.data.marketCap,
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error executing API request:', error);
    return null;
  }
}

// Get top movers
export async function getTopMovers(): Promise<MarketData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/top-movers`);
    if (response.data.error) {
      console.error('Error fetching top movers:', response.data.error);
      return [];
    }
    return response.data.sort((a: MarketData, b: MarketData) => 
      Math.abs(b.changePercent) - Math.abs(a.changePercent)
    );
  } catch (error) {
    console.error('Error executing API request:', error);
    return [];
  }
}

// Get market indices
export async function getMarketIndices(): Promise<MarketData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/market-indices`);
    if (response.data.error) {
      console.error('Error fetching market indices:', response.data.error);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error('Error executing API request:', error);
    return [];
  }
}

// Get sector performance
export async function getSectorPerformance(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/sector-performance`);
    if (response.data.error) {
      console.error('Error fetching sector performance:', response.data.error);
      return [];
    }
    return response.data.sort((a: any, b: any) => b.performance - a.performance);
  } catch (error) {
    console.error('Error executing API request:', error);
    return [];
  }
} 