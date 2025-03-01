import axios from 'axios';
import { NewsItem } from './marketApi';

const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface NewsSource {
  id: string;
  name: string;
  category: string;
  reliability: number;
  bias: number;
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  aspects: {
    topic: string;
    sentiment: string;
    score: number;
  }[];
}

interface MarketImpact {
  score: number;
  probability: number;
  timeframe: 'immediate' | 'short_term' | 'long_term';
  affectedSectors: string[];
  confidence: number;
}

interface EnhancedNewsItem {
  id: string;
  title: string;
  summary: string;
  sourceInfo: NewsSource;
  source: string;
  url: string;
  timestamp: number;
  sentiment: SentimentAnalysis;
  marketImpact: MarketImpact;
  categories: string[];
  entities: {
    name: string;
    type: string;
    sentiment: number;
  }[];
  keywords: string[];
  symbols: string[];
  relevance: number;
}

class NewsAnalysisService {
  private readonly sources: NewsSource[] = [
    {
      id: 'bloomberg',
      name: 'Bloomberg',
      category: 'financial',
      reliability: 0.95,
      bias: 0.1
    },
    {
      id: 'reuters',
      name: 'Reuters',
      category: 'financial',
      reliability: 0.95,
      bias: 0.05
    },
    {
      id: 'wsj',
      name: 'Wall Street Journal',
      category: 'financial',
      reliability: 0.9,
      bias: 0.2
    },
    // Add more sources as needed
  ];

  private cache: Map<string, { data: EnhancedNewsItem; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getNews(symbol: string): Promise<EnhancedNewsItem[]> {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: symbol,
          language: 'en',
          sortBy: 'relevancy',
          apiKey: NEWSAPI_KEY
        }
      });

      const newsItems = await Promise.all(
        response.data.articles.map(async (article: any) => {
          const cacheKey = article.url;
          const cached = this.cache.get(cacheKey);

          if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
          }

          const enhancedNews = await this.enhanceNewsItem(article);
          this.cache.set(cacheKey, {
            data: enhancedNews,
            timestamp: Date.now()
          });

          return enhancedNews;
        })
      );

      return this.rankNewsByRelevance(newsItems);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  private async enhanceNewsItem(article: any): Promise<EnhancedNewsItem> {
    const [sentiment, marketImpact] = await Promise.all([
      this.analyzeSentiment(article.content),
      this.analyzeMarketImpact(article.content)
    ]);

    const source = this.sources.find(s => s.id === article.source.id) || {
      id: article.source.id,
      name: article.source.name,
      category: 'unknown',
      reliability: 0.5,
      bias: 0
    };

    return {
      id: article.url,
      title: article.title,
      summary: await this.generateSummary(article.content),
      sourceInfo: source,
      source: article.source.name,
      url: article.url,
      timestamp: new Date(article.publishedAt).getTime(),
      sentiment,
      marketImpact,
      categories: await this.categorizeArticle(article.content),
      entities: await this.extractEntities(article.content),
      keywords: await this.extractKeywords(article.content),
      symbols: await this.extractSymbols(article.content),
      relevance: this.calculateRelevance(article, source)
    };
  }

  private async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Here we would typically use a natural language processing API
      // For now, we'll use a simplified implementation
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment of the following text and return a JSON object with sentiment (positive/negative/neutral), score (-1 to 1), confidence (0 to 1), and relevant aspects.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        aspects: []
      };
    }
  }

  private async analyzeMarketImpact(text: string): Promise<MarketImpact> {
    try {
      // Similar to sentiment analysis, we would use an AI model
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Analyze the potential market impact of the following news and return a JSON object with impact score, probability, timeframe, affected sectors, and confidence.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing market impact:', error);
      return {
        score: 0,
        probability: 0,
        timeframe: 'short_term',
        affectedSectors: [],
        confidence: 0
      };
    }
  }

  private async generateSummary(text: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Summarize the following text in 2-3 sentences, focusing on market-relevant information.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      return text.substring(0, 200) + '...';
    }
  }

  private async categorizeArticle(text: string): Promise<string[]> {
    // Implement article categorization
    return [];
  }

  private async extractEntities(text: string): Promise<{ name: string; type: string; sentiment: number; }[]> {
    // Implement named entity recognition
    return [];
  }

  private async extractKeywords(text: string): Promise<string[]> {
    // Implement keyword extraction
    return [];
  }

  private async extractSymbols(text: string): Promise<string[]> {
    // Implement stock symbol extraction
    return [];
  }

  private calculateRelevance(article: any, source: NewsSource): number {
    // Calculate article relevance based on various factors
    const age = (Date.now() - new Date(article.publishedAt).getTime()) / (24 * 60 * 60 * 1000);
    const ageScore = Math.max(0, 1 - age / 7); // Decay over 7 days

    return (
      source.reliability * 0.3 +
      ageScore * 0.3 +
      (article.title.length > 50 ? 0.2 : 0.1) +
      (article.content.length > 1000 ? 0.2 : 0.1)
    );
  }

  private rankNewsByRelevance(news: EnhancedNewsItem[]): EnhancedNewsItem[] {
    return news.sort((a, b) => {
      const scoreA = this.calculateNewsScore(a);
      const scoreB = this.calculateNewsScore(b);
      return scoreB - scoreA;
    });
  }

  private calculateNewsScore(news: EnhancedNewsItem): number {
    const age = (Date.now() - news.timestamp) / (24 * 60 * 60 * 1000);
    const ageScore = Math.max(0, 1 - age / 7);

    return (
      news.relevance * 0.3 +
      Math.abs(news.sentiment.score) * 0.2 +
      news.sentiment.confidence * 0.2 +
      Math.abs(news.marketImpact.score) * 0.15 +
      news.marketImpact.confidence * 0.15
    ) * ageScore;
  }
}

export const newsAnalysisService = new NewsAnalysisService(); 