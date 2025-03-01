import axios from 'axios';
import { NewsItem } from '../types';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export async function getAlphaVantageNews(symbol: string, companyName: string): Promise<NewsItem[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.error('Alpha Vantage API key is not configured');
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/query`, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: symbol,
        topics: 'insurance,mergers_and_acquisitions',
        sort: 'RELEVANCE',
        limit: 15,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    if (!response.data || !response.data.feed) {
      return [];
    }

    // Filter and score articles
    const articles = response.data.feed
      .filter((article: any) => {
        const text = (article.title + ' ' + article.summary).toLowerCase();
        return text.includes('insurance') || 
               text.includes('reinsurance') || 
               text.includes(symbol.toLowerCase()) ||
               (companyName && text.includes(companyName.toLowerCase()));
      })
      .map((article: any) => {
        // Calculate relevance score
        const text = (article.title + ' ' + article.summary).toLowerCase();
        let score = 0;
        
        // Direct company mentions
        if (text.includes(symbol.toLowerCase())) score += 3;
        if (companyName && text.includes(companyName.toLowerCase())) score += 3;
        
        // Industry relevance
        if (text.includes('insurance')) score += 2;
        if (text.includes('reinsurance')) score += 2;
        if (text.includes('property insurance')) score += 2;
        
        return {
          ...article,
          relevanceScore: score
        };
      })
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .map((article: any) => ({
        title: article.title,
        description: article.summary,
        url: article.url,
        publishedAt: article.time_published,
        source: {
          name: article.source,
        },
      }));

    return articles;
  } catch (error) {
    console.error('Error fetching Alpha Vantage news:', error);
    return [];
  }
} 