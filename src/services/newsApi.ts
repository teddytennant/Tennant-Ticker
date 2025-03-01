import axios from 'axios';
import { NewsItem } from '../types';
import toast from 'react-hot-toast';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Track if we've hit the API limit
let apiLimitReached = false;

// Mock news data for fallback when API fails or returns no results
const MOCK_NEWS: Record<string, NewsItem[]> = {
  default: [
    {
      title: "Markets Update: Stocks Rally on Economic Data",
      description: "Major indices climbed as new economic data suggested strong consumer spending.",
      url: "https://example.com/markets-update",
      publishedAt: new Date().toISOString(),
      source: { name: "Market News" }
    },
    {
      title: "Fed Signals Potential Rate Cut in Coming Months",
      description: "Federal Reserve officials hinted at possible interest rate cuts as inflation pressures ease.",
      url: "https://example.com/fed-signals",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: "Financial Times" }
    },
    {
      title: "Earnings Season: What to Expect from Major Companies",
      description: "Analysts predict strong earnings from technology and financial sectors this quarter.",
      url: "https://example.com/earnings-preview",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: "Business Insider" }
    }
  ],
  AAPL: [
    {
      title: "Apple designer Susan Kare made 32 new, Mac-inspired, physical icons",
      description: "Legendary Apple artist Susan Kare has released 32 new retro-inspired icons that are designed to live outside of your computer screen.",
      url: "https://www.theverge.com/2024/2/24/24083423/susan-kare-apple-mac-icons-esc-keys-mechanical-keyboard",
      publishedAt: new Date().toISOString(),
      source: { name: "The Verge" }
    },
    {
      title: "Apple Cancels Mac-Connected AR Smart Glasses",
      description: "Apple is no longer developing augmented reality glasses designed to pair with the Mac, reports Bloomberg's Mark Gurman.",
      url: "https://www.macrumors.com/2024/1/31/apple-cancels-mac-connected-ar-glasses/",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: "MacRumors" }
    },
    {
      title: "Apple Reports Q1 FY2025 Results",
      description: "Apple today announced financial results for its fiscal 2025 first quarter ended December 28, 2024.",
      url: "https://www.apple.com/newsroom/2024/01/apple-reports-first-quarter-results/",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: "Apple Newsroom" }
    },
    {
      title: "Apple's Q1 2025 Earnings Call Takeaways",
      description: "Apple today held an earnings call to report results for the first fiscal quarter of 2025, with Apple CEO Tim Cook and CFO providing insight into Apple's performance.",
      url: "https://www.macrumors.com/2024/01/30/apple-q1-2025-earnings-call-takeaways/",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: "MacRumors" }
    }
  ],
  MSFT: [
    {
      title: "Microsoft Cloud Business Drives Record Quarter",
      description: "Azure and cloud services continue to be the main growth driver for the tech giant.",
      url: "https://example.com/microsoft-cloud",
      publishedAt: new Date().toISOString(),
      source: { name: "Tech Report" }
    },
    {
      title: "Microsoft Expands AI Capabilities Across Product Line",
      description: "New AI features are being integrated into Office, Windows, and developer tools.",
      url: "https://example.com/microsoft-ai",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: "Tech Insider" }
    }
  ],
  TSLA: [
    {
      title: "Tesla Delivers Record Number of Vehicles in Q2",
      description: "Electric vehicle maker exceeded analyst expectations with quarterly delivery numbers.",
      url: "https://example.com/tesla-deliveries",
      publishedAt: new Date().toISOString(),
      source: { name: "Auto News" }
    },
    {
      title: "Tesla's Full Self-Driving Technology Reaches New Milestone",
      description: "The company announced significant improvements to its autonomous driving capabilities.",
      url: "https://example.com/tesla-fsd",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: "Tech Drive" }
    }
  ]
};

export async function getStockNews(symbol: string): Promise<NewsItem[]> {
  console.log(`Getting news for ${symbol}...`);
  
  // If we've already hit the API limit, return mock data
  if (apiLimitReached) {
    console.log('API limit reached, returning mock data');
    toast.error("News API request limit reached. Showing sample news.");
    return getMockNewsForSymbol(symbol);
  }

  try {
    // Try to get real news from the API
    const newsItems = await getNewsApiNews(symbol);
    
    // If we got valid news items, return them after filtering
    if (newsItems && newsItems.length > 0) {
      console.log(`Successfully retrieved ${newsItems.length} news items for ${symbol}`);
      return filterAndDedupNews(newsItems);
    }
    
    // If no news items were found, return mock data
    console.log(`No news found for ${symbol}, returning mock data`);
    return getMockNewsForSymbol(symbol);
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Check if the error is due to API limit
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.log('News API request limit reached');
      apiLimitReached = true;
      toast.error("News API request limit reached. Showing sample news.");
    } else {
      toast.error("Error fetching news. Showing sample news.");
    }
    
    // Return mock data for the symbol
    return getMockNewsForSymbol(symbol);
  }
}

async function getNewsApiNews(symbol: string): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) {
    console.error('News API key is not configured');
    toast.error('News API key is not configured');
    return [];
  }

  try {
    // Calculate date for 'from' parameter (30 days ago)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const fromDateStr = fromDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Get company name and ticker info for better search
    const companyInfo = getCompanyInfo(symbol);
    console.log(`Fetching news for ${symbol} (${companyInfo.name})`);

    // Build a more specific query based on the symbol and company info
    const query = buildNewsQuery(symbol, companyInfo);
    console.log(`Using query: ${query}`);

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: query,
        from: fromDateStr,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY,
        language: 'en',
        pageSize: 20
      },
    });

    console.log(`News API response status: ${response.status}`);
    
    if (!response.data?.articles || !Array.isArray(response.data.articles)) {
      console.error('Invalid response format from News API:', response.data);
      return [];
    }

    console.log(`Found ${response.data.articles.length} news articles for ${symbol}`);
    
    // Transform and filter the articles
    const transformedArticles = response.data.articles
      .map(transformNewsApiArticle)
      .filter(article => isRelevantArticle(article, symbol, companyInfo));
      
    console.log(`After filtering, ${transformedArticles.length} relevant articles remain`);
    return transformedArticles;
  } catch (error) {
    console.error('Error fetching from News API:', error);
    
    // Log detailed error information
    if (axios.isAxiosError(error)) {
      console.error('News API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Check if the error is due to API limit and set the flag
      if (error.response?.status === 429) {
        apiLimitReached = true;
        toast.error('News API request limit reached');
      } else {
        toast.error(`Error fetching news: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error fetching news');
    }
    
    throw error; // Re-throw to be handled by the parent function
  }
}

function transformNewsApiArticle(article: any): NewsItem {
  return {
    title: safeString(article?.title),
    description: safeString(article?.description),
    url: safeString(article?.url),
    publishedAt: safeString(article?.publishedAt || new Date().toISOString()),
    source: {
      name: safeString(article?.source?.name || 'Unknown Source')
    }
  };
}

function filterAndDedupNews(newsItems: NewsItem[]): NewsItem[] {
  // Filter out unwanted sources and duplicates
  const seen = new Set<string>();
  return newsItems
    .filter(item => {
      const source = (item.source.name || '').toLowerCase();
      const url = (item.url || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      
      // Skip items with empty titles or descriptions
      if (!item.title || !item.description) {
        return false;
      }
      
      // Filter out unwanted sources
      if (source.includes('seeking') || 
          url.includes('seekingalpha.com') ||
          source.includes('fool') ||
          url.includes('fool.com') ||
          source.includes('zacks') ||
          url.includes('zacks.com') ||
          source.includes('investorplace') ||
          url.includes('investorplace.com') ||
          source.includes('thestreet') ||
          url.includes('thestreet.com') ||
          source.includes('benzinga') ||
          url.includes('benzinga.com') ||
          title.includes('press release') ||
          title.includes('sponsored:') ||
          title.includes('advertisement:')) {
        return false;
      }

      // Deduplicate based on title
      const titleKey = title;
      if (seen.has(titleKey)) {
        return false;
      }
      seen.add(titleKey);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function safeString(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

interface CompanyInfo {
  name: string;
  industry: string;
  keywords: string[];
}

function getCompanyInfo(symbol: string): CompanyInfo {
  // Add company information for better search results
  const companyInfoMap: Record<string, CompanyInfo> = {
    'AAPL': {
      name: 'Apple',
      industry: 'Technology',
      keywords: ['iPhone', 'iPad', 'Mac', 'iOS', 'Tim Cook']
    },
    'MSFT': {
      name: 'Microsoft',
      industry: 'Technology',
      keywords: ['Windows', 'Azure', 'Office', 'Satya Nadella']
    },
    'GOOGL': {
      name: 'Google',
      industry: 'Technology',
      keywords: ['Alphabet', 'Android', 'Search', 'Sundar Pichai']
    },
    'AMZN': {
      name: 'Amazon',
      industry: 'Technology',
      keywords: ['AWS', 'e-commerce', 'Andy Jassy']
    },
    'META': {
      name: 'Meta',
      industry: 'Technology',
      keywords: ['Facebook', 'Instagram', 'WhatsApp', 'Mark Zuckerberg']
    },
    'TSLA': {
      name: 'Tesla',
      industry: 'Automotive',
      keywords: ['Electric vehicles', 'EV', 'Elon Musk']
    },
    'NVDA': {
      name: 'NVIDIA',
      industry: 'Technology',
      keywords: ['GPU', 'AI', 'Jensen Huang']
    },
    'HG': {
      name: 'Hamilton Insurance Group',
      industry: 'Insurance',
      keywords: ['Bermuda', 'reinsurance', 'property', 'casualty']
    },
    'JPM': {
      name: 'JPMorgan Chase',
      industry: 'Finance',
      keywords: ['bank', 'Jamie Dimon']
    },
    'BAC': {
      name: 'Bank of America',
      industry: 'Finance',
      keywords: ['bank', 'Brian Moynihan']
    },
    'WMT': {
      name: 'Walmart',
      industry: 'Retail',
      keywords: ['retail', 'e-commerce', 'Doug McMillon']
    },
    'JNJ': {
      name: 'Johnson & Johnson',
      industry: 'Healthcare',
      keywords: ['pharmaceutical', 'medical devices', 'consumer health']
    },
    'PG': {
      name: 'Procter & Gamble',
      industry: 'Consumer Goods',
      keywords: ['consumer products', 'household goods']
    },
    'XOM': {
      name: 'Exxon Mobil',
      industry: 'Energy',
      keywords: ['oil', 'gas', 'energy']
    },
    'V': {
      name: 'Visa',
      industry: 'Finance',
      keywords: ['payment', 'credit card', 'financial services']
    },
    'MA': {
      name: 'Mastercard',
      industry: 'Finance',
      keywords: ['payment', 'credit card', 'financial services']
    },
    'DIS': {
      name: 'Disney',
      industry: 'Entertainment',
      keywords: ['entertainment', 'streaming', 'theme parks', 'Bob Iger']
    },
    'NFLX': {
      name: 'Netflix',
      industry: 'Entertainment',
      keywords: ['streaming', 'content', 'Ted Sarandos']
    }
  };
  
  return companyInfoMap[symbol] || {
    name: symbol,
    industry: 'Business',
    keywords: ['stock', 'company', 'business']
  };
}

function buildNewsQuery(symbol: string, companyInfo: CompanyInfo): string {
  // Special case for certain symbols
  if (symbol === 'HG') {
    return `("Hamilton Insurance Group" OR "Hamilton Group" insurance) AND (stock OR shares OR investors OR financial)`;
  }
  
  if (symbol === 'AAPL') {
    return `("Apple" OR "AAPL" OR "Tim Cook") AND (stock OR shares OR investors OR financial OR earnings OR company OR iPhone OR Mac OR iPad)`;
  }
  
  // For well-known companies, create a more specific query
  if (companyInfo.name !== symbol) {
    const keywordString = companyInfo.keywords.length > 0 
      ? ` OR "${companyInfo.keywords.slice(0, 3).join('" OR "')}"` 
      : '';
      
    return `("${companyInfo.name}" OR "${symbol}")${keywordString} AND (stock OR shares OR investors OR financial OR earnings OR company)`;
  }
  
  // Generic query for symbols without specific mappings
  return `${symbol} stock`;
}

function isRelevantArticle(article: NewsItem, symbol: string, companyInfo: CompanyInfo): boolean {
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const content = title + ' ' + description;
  
  // Check if the article mentions the company name or symbol
  const hasCompanyName = content.includes(companyInfo.name.toLowerCase()) || 
                         content.includes(symbol.toLowerCase());
                         
  // Check if it mentions any of the company keywords
  const hasKeywords = companyInfo.keywords.some(keyword => 
    content.includes(keyword.toLowerCase())
  );
  
  // Check if it has financial terms
  const hasFinancialTerms = content.includes('stock') || 
                           content.includes('shares') || 
                           content.includes('investors') ||
                           content.includes('earnings') ||
                           content.includes('revenue') ||
                           content.includes('profit') ||
                           content.includes('financial');
  
  // Article is relevant if it mentions the company and has either keywords or financial terms
  return hasCompanyName && (hasKeywords || hasFinancialTerms);
}

function getMockNewsForSymbol(symbol: string): NewsItem[] {
  // Return symbol-specific mock news if available, otherwise return default mock news
  return MOCK_NEWS[symbol] || MOCK_NEWS.default;
}