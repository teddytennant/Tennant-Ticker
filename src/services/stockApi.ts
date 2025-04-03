import { getQuote, getHistoricalData, getCompanyInfo } from './yfinanceApi';
import { toast } from 'react-hot-toast';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export async function getStockQuote(symbol: string): Promise<StockData | null> {
  try {
    const quote = await getQuote(symbol);
    if (!quote) {
      throw new Error('No quote data available');
    }

    return {
      symbol: quote.symbol,
      name: quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      previousClose: quote.regularMarketPreviousClose
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    toast.error('Failed to fetch stock quote');
    return null;
  }
}

export async function getHistoricalData(symbol: string, timeframe: '1d' | '1w' | '1m' | '3m' | '1y' = '1m'): Promise<HistoricalDataPoint[]> {
  try {
    // Convert timeframe to yfinance period format
    const periodMap = {
      '1d': '1d',
      '1w': '5d',
      '1m': '1mo',
      '3m': '3mo',
      '1y': '1y'
    };

    const data = await getHistoricalData(symbol, periodMap[timeframe]);
    if (!data || data.length === 0) {
      throw new Error('No historical data available');
    }

    return data.map(point => ({
      date: point.Date,
      open: point.Open,
      high: point.High,
      low: point.Low,
      close: point.Close,
      volume: point.Volume,
      adjustedClose: point['Adj Close']
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    toast.error('Failed to fetch historical data');
    return [];
  }
}

export async function getCompanyOverview(symbol: string) {
  try {
    const info = await getCompanyInfo(symbol);
    if (!info) {
      throw new Error('No company information available');
    }
    return info;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    toast.error('Failed to fetch company information');
    return null;
  }
}