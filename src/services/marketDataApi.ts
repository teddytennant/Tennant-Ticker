import axios from 'axios';
import {
  getQuote,
  getHistoricalData,
  getCompanyInfo,
  getTopMovers as getYFTopMovers,
  getMarketIndices as getYFMarketIndices,
  getSectorPerformance as getYFSectorPerformance
} from './yfinanceApi';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

// Block list for news sources
const BLOCKED_SOURCES = [
  'seeking alpha',
  'seekingalpha',
  'seeking-alpha',
  'sa',
  'sa breaking news',
  'sa transcripts'
];

// List of major US stocks to track for top movers
const MAJOR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 
  'V', 'WMT', 'UNH', 'JNJ', 'XOM', 'BAC', 'PG', 'MA', 'HD', 'CVX',
  'ABBV', 'PFE', 'AVGO', 'KO', 'PEP', 'MRK', 'COST'
];

// Simulated market data for demonstration
const MOCK_INDICES: MarketData[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 508.23,
    change: 2.45,
    changePercent: 0.48,
  },
  {
    symbol: 'QQQ',
    name: 'NASDAQ',
    price: 428.31,
    change: 3.92,
    changePercent: 0.92,
  },
  {
    symbol: 'DIA',
    name: 'Dow Jones',
    price: 38765.12,
    change: -85.23,
    changePercent: -0.22,
  },
  {
    symbol: 'IWM',
    name: 'Russell 2000',
    price: 2012.45,
    change: 15.67,
    changePercent: 0.78,
  },
];

const MOCK_TOP_MOVERS: MarketData[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 785.38,
    change: 35.27,
    changePercent: 4.70,
    volume: 8234567,
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    price: 24.89,
    change: 2.34,
    changePercent: 10.38,
    volume: 12345678,
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 178.23,
    change: -8.45,
    changePercent: -4.52,
    volume: 5678901,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 193.57,
    change: -12.34,
    changePercent: -6.00,
    volume: 9876543,
  },
];

export async function getTopMovers(): Promise<MarketData[]> {
  try {
    console.log('Fetching top movers data...');
    const movers = await getYFTopMovers();
    
    if (movers.length > 0) {
      console.log(`Successfully fetched ${movers.length} top movers`);
      return movers;
    } else {
      console.log('No top movers data from API, using mock data');
      return MOCK_TOP_MOVERS;
    }
  } catch (error) {
    console.error('Error fetching top movers:', error);
    console.log('Using mock top movers data due to error');
    return MOCK_TOP_MOVERS;
  }
}

export async function getMarketIndices(): Promise<MarketData[]> {
  try {
    console.log('Fetching market indices data...');
    const indices = await getYFMarketIndices();
    
    if (indices.length > 0) {
      console.log(`Successfully fetched ${indices.length} market indices`);
      return indices;
    } else {
      console.log('No market indices data from API, using mock data');
      return MOCK_INDICES;
    }
  } catch (error) {
    console.error('Error fetching market indices:', error);
    console.log('Using mock market indices data due to error');
    return MOCK_INDICES;
  }
}

export async function getSectorPerformance(): Promise<any[]> {
  try {
    const performance = await getYFSectorPerformance();
    if (performance.length > 0) {
      return performance;
    }
    throw new Error('No sector performance data available');
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    return [];
  }
}

// Helper function to get company name from symbol
function getCompanyName(symbol: string): string {
  const companies: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla, Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'UNH': 'UnitedHealth Group Inc.',
    'JNJ': 'Johnson & Johnson',
    'XOM': 'Exxon Mobil Corporation',
    'BAC': 'Bank of America Corp.',
    'PG': 'Procter & Gamble Co.',
    'MA': 'Mastercard Inc.',
    'HD': 'The Home Depot Inc.',
    'CVX': 'Chevron Corporation',
    'ABBV': 'AbbVie Inc.',
    'PFE': 'Pfizer Inc.',
    'AVGO': 'Broadcom Inc.',
    'KO': 'The Coca-Cola Co.',
    'PEP': 'PepsiCo Inc.',
    'MRK': 'Merck & Co. Inc.',
    'COST': 'Costco Wholesale Corporation'
  };
  
  return companies[symbol] || symbol;
}

// Helper function to get index name from symbol
function getIndexName(symbol: string): string {
  const indices: { [key: string]: string } = {
    'SPY': 'S&P 500',
    'QQQ': 'NASDAQ',
    'DIA': 'Dow Jones',
    'IWM': 'Russell 2000'
  };
  
  return indices[symbol] || symbol;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image?: string;
}

// Track if we've already shown an error message for market news
let marketNewsErrorShown = false;

export async function getMarketNews(category: string = 'general'): Promise<NewsItem[]> {
  try {
    // Map our UI categories to NewsAPI categories
    let apiCategory = category.toLowerCase();
    
    // NewsAPI supports: business, entertainment, general, health, science, sports, technology
    // Map our custom categories to appropriate NewsAPI categories
    if (apiCategory === 'finance') {
      apiCategory = 'business';
    } else if (apiCategory === 'crypto') {
      apiCategory = 'business'; // Use business for crypto as NewsAPI doesn't have a crypto category
    } else if (apiCategory === 'commodities') {
      apiCategory = 'business'; // Use business for commodities as NewsAPI doesn't have a commodities category
    } else if (!['business', 'technology', 'general'].includes(apiCategory)) {
      apiCategory = 'general'; // Default to general for any other category
    }
    
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
      params: {
        category: apiCategory,
        language: 'en',
        country: 'us',
        pageSize: 20,
        apiKey: NEWS_API_KEY
      }
    });

    if (!Array.isArray(response.data.articles)) {
      throw new Error('Invalid news data received');
    }

    interface NewsApiArticle {
      title: string;
      description: string;
      url: string;
      source: {
        name: string;
      };
      publishedAt: string;
      urlToImage?: string;
    }

    return response.data.articles
      .filter((article: NewsApiArticle) => article.title && article.description && article.url)
      .map((article: NewsApiArticle, index: number) => ({
        id: `${index}-${Date.now()}`,
        headline: article.title,
        summary: article.description,
        source: article.source.name,
        url: article.url,
        datetime: new Date(article.publishedAt).getTime(),
        category: category.toLowerCase(), // Use the requested category
        related: article.source.name,
        image: article.urlToImage
      }))
      .sort((a: NewsItem, b: NewsItem) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error fetching market news:', error);
    
    // Only show the error message once
    if (!marketNewsErrorShown) {
      // Check if it's an API limit error
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.log('News API request limit reached for market news');
        marketNewsErrorShown = true;
        // Return mock data instead of throwing
        return getMockMarketNews(category);
      } else {
        marketNewsErrorShown = true;
      }
    }
    
    // Return mock data instead of throwing
    return getMockMarketNews(category);
  }
}

// Mock market news data for fallback
function getMockMarketNews(category: string): NewsItem[] {
  const now = Date.now();
  
  return [
    {
      id: `mock-1-${now}`,
      headline: "Markets Update: Stocks Rally on Economic Data",
      summary: "Major indices climbed as new economic data suggested strong consumer spending.",
      source: "Market News",
      url: "#",
      datetime: now,
      category: category.toLowerCase(),
      related: "Market News"
    },
    {
      id: `mock-2-${now}`,
      headline: "Fed Signals Potential Rate Cut in Coming Months",
      summary: "Federal Reserve officials hinted at possible interest rate cuts as inflation pressures ease.",
      source: "Financial Times",
      url: "#",
      datetime: now - 86400000,
      category: category.toLowerCase(),
      related: "Financial Times"
    },
    {
      id: `mock-3-${now}`,
      headline: "Earnings Season: What to Expect from Major Companies",
      summary: "Analysts predict strong earnings from technology and financial sectors this quarter.",
      source: "Business Insider",
      url: "#",
      datetime: now - 172800000,
      category: category.toLowerCase(),
      related: "Business Insider"
    }
  ];
} 