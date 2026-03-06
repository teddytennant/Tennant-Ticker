import { NewsItem } from '../types';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2';

export async function getStockNews(symbol: string): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) {
    console.warn('News API key is not configured. Returning empty news list.');
    return [];
  }

  try {
    const response = await fetch(
      `${NEWS_API_URL}/everything?q=${encodeURIComponent(symbol)}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      return [];
    }

    return data.articles.map((article: Record<string, unknown>) => ({
      title: String(article.title ?? ''),
      description: String(article.description ?? ''),
      url: String(article.url ?? ''),
      publishedAt: String(article.publishedAt ?? ''),
      source: {
        name: typeof article.source === 'object' && article.source !== null
          ? String((article.source as Record<string, unknown>).name ?? 'Unknown')
          : 'Unknown',
      },
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

export async function searchNews(query: string): Promise<NewsItem[]> {
  return getStockNews(query);
}
