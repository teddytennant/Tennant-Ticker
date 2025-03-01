import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
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

// Simulate some random price movements
function addRandomPriceMovement(data: MarketData[]): MarketData[] {
  return data.map(item => {
    const randomChange = (Math.random() - 0.5) * 2; // Random number between -1 and 1
    const newPrice = item.price * (1 + randomChange / 100);
    const change = newPrice - item.price;
    return {
      ...item,
      price: newPrice,
      change,
      changePercent: (change / item.price) * 100,
    };
  });
}

export async function getTopMovers(): Promise<MarketData[]> {
  try {
    console.log('Fetching top movers data...');
    const movers: MarketData[] = [];
    
    // Get data for major stocks from Alpha Vantage
    for (const symbol of MAJOR_STOCKS.slice(0, 4)) { // Limit to 4 stocks to avoid rate limits
      try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        const quote = response.data['Global Quote'];
        if (quote) {
          movers.push({
            symbol,
            name: getCompanyName(symbol), // Use our company name mapping
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume'])
          });
          console.log(`Successfully fetched data for ${symbol}`);
        } else {
          console.error(`No quote data for ${symbol}:`, response.data);
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }

      // Add delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (movers.length > 0) {
      console.log(`Successfully fetched ${movers.length} top movers`);
      return movers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    } else {
      console.log('No top movers data from API, using mock data');
      return MOCK_TOP_MOVERS; // Fallback to mock data if no results
    }
  } catch (error) {
    console.error('Error fetching top movers:', error);
    console.log('Using mock top movers data due to error');
    return MOCK_TOP_MOVERS; // Always fallback to mock data if API fails
  }
}

export async function getMarketIndices(): Promise<MarketData[]> {
  try {
    console.log('Fetching market indices data...');
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const marketIndices: MarketData[] = [];

    for (const symbol of indices) {
      try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        const quote = response.data['Global Quote'];
        if (quote) {
          marketIndices.push({
            symbol,
            name: getIndexName(symbol),
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
          });
          console.log(`Successfully fetched data for ${symbol} (${getIndexName(symbol)})`);
        } else {
          console.error(`No quote data for ${symbol}:`, response.data);
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }

      // Add delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (marketIndices.length > 0) {
      console.log(`Successfully fetched ${marketIndices.length} market indices`);
      return marketIndices;
    } else {
      console.log('No market indices data from API, using mock data');
      return MOCK_INDICES; // Fallback to mock data if no results
    }
  } catch (error) {
    console.error('Error fetching market indices:', error);
    console.log('Using mock market indices data due to error');
    return MOCK_INDICES; // Always fallback to mock data if API fails
  }
}

export interface SectorPerformance {
  sector: string;
  performance: number;
  lastUpdated: string;
}

export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SECTOR',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const data = response.data;
    if (!data || !data['Rank A: Real-Time Performance']) {
      throw new Error('Invalid sector performance data');
    }

    const sectors = data['Rank A: Real-Time Performance'];
    const performances: SectorPerformance[] = Object.entries(sectors)
      .filter(([key]) => key !== 'Last Refreshed')
      .map(([sector, performance]: [string, any]) => ({
        sector,
        performance: parseFloat(String(performance).replace('%', '')),
        lastUpdated: new Date().toISOString()
      }));

    return performances.sort((a, b) => b.performance - a.performance);
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    return [];
  }
}

function getIndexName(symbol: string): string {
  switch (symbol) {
    case 'SPY':
      return 'S&P 500';
    case 'QQQ':
      return 'NASDAQ 100';
    case 'DIA':
      return 'Dow Jones';
    case 'IWM':
      return 'Russell 2000';
    default:
      return symbol;
  }
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
    throw new Error('Failed to fetch market news');
  }
}

// Helper function to get company name for a symbol
function getCompanyName(symbol: string): string {
  // Add company name mappings for better search results
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple',
    'MSFT': 'Microsoft',
    'GOOGL': 'Google',
    'AMZN': 'Amazon',
    'META': 'Meta',
    'TSLA': 'Tesla',
    'NVDA': 'NVIDIA',
    'HG': 'Hamilton Insurance Group',
    'JPM': 'JPMorgan Chase',
    'BAC': 'Bank of America',
    'WMT': 'Walmart',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
    'XOM': 'Exxon Mobil',
    'V': 'Visa',
    'MA': 'Mastercard',
    'DIS': 'Disney',
    'NFLX': 'Netflix',
    'INTC': 'Intel',
    'AMD': 'Advanced Micro Devices',
    'IBM': 'IBM',
    'CSCO': 'Cisco',
    'ORCL': 'Oracle',
    'CRM': 'Salesforce',
  };
  return companyNames[symbol] || symbol;
} 