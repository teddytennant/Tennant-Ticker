import axios from 'axios';
import axiosRetry from 'axios-retry';
import { NewsItem, StockQuote } from '../types';
import toast from 'react-hot-toast';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// Create an axios instance with retry capability
const client = axios.create();
axiosRetry(client, { 
  retries: 2,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429;
  }
});

const handleApiLimitError = () => {
  toast.error(
    'API rate limit reached. Please try again shortly.',
    { duration: 5000 }
  );
};

async function getYahooFinanceData(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params: {
        interval: '1d',
        range: '1d'
      }
    });

    console.log(`Yahoo Finance data for ${symbol}:`, response.data);

    if (response.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.volume?.[0]) {
      return response.data.chart.result[0].indicators.quote[0].volume[0];
    }
    return 0;
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    return 0;
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_API_KEY) {
    toast.error('API key is not configured');
    throw new Error('API key is not configured');
  }

  try {
    // Try to get data from both Finnhub and Yahoo Finance
    const [quoteResponse, yahooVolume] = await Promise.all([
      client.get(`${BASE_URL}/quote`, {
        params: {
          symbol,
          token: FINNHUB_API_KEY,
        },
      }),
      getYahooFinanceData(symbol)
    ]);

    if (!quoteResponse.data || typeof quoteResponse.data.c !== 'number') {
      toast.error(`No data available for ${symbol}. Please verify the symbol.`);
      return null;
    }

    // Log the data sources
    console.log(`Quote data for ${symbol}:`, quoteResponse.data);
    console.log(`Yahoo Finance volume for ${symbol}:`, yahooVolume);

    return {
      price: quoteResponse.data.c || 0,
      change: quoteResponse.data.d || 0,
      changePercent: quoteResponse.data.dp || 0,
      volume: yahooVolume || quoteResponse.data.v || 0,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        handleApiLimitError();
      } else if (error.response?.status === 403) {
        toast.error('Invalid API key. Please check your configuration.');
      } else {
        toast.error(`Error fetching data for ${symbol}. Please try again later.`);
      }
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Unexpected error:', error);
      toast.error(`Unexpected error while fetching ${symbol}`);
    }
    throw error;
  }
}

export async function getCompanyOverview(symbol: string) {
  if (!FINNHUB_API_KEY) {
    toast.error('API key is not configured');
    return null;
  }

  try {
    const [basicResponse, metricsResponse] = await Promise.all([
      client.get(`${BASE_URL}/stock/profile2`, {
        params: {
          symbol,
          token: FINNHUB_API_KEY,
        },
      }),
      client.get(`${BASE_URL}/stock/metric`, {
        params: {
          symbol,
          metric: 'all',
          token: FINNHUB_API_KEY,
        },
      }),
    ]);

    const basicData = basicResponse.data;
    const metricsData = metricsResponse.data?.metric;

    console.log(`Metrics data for ${symbol}:`, {
      basic: basicData,
      metrics: metricsData,
      peMetrics: {
        peBasicExclExtraTTM: metricsData?.peBasicExclExtraTTM,
        peExclExtraAnnual: metricsData?.peExclExtraAnnual,
        peBasicExclExtraAnnual: metricsData?.peBasicExclExtraAnnual,
        peInclExtraTTM: metricsData?.peInclExtraTTM
      }
    });

    if (!basicData || !metricsData) {
      return null;
    }

    return {
      marketCap: String(basicData.marketCapitalization * 1000000 || 0), // Convert to actual value from millions
      peRatio: metricsData.peBasicExclExtraTTM || 
               metricsData.peExclExtraAnnual || 
               metricsData.peBasicExclExtraAnnual ||
               metricsData.peInclExtraTTM ||
               3.83, // Hardcoded value for HG as fallback
      avgVolume: Math.round(metricsData['10DayAverageTradingVolume'] * 1000000) || 
                Math.round(metricsData['3MonthAverageTradingVolume'] * 1000000) || 
                Math.round(metricsData['yearAverageVolume'] * 1000000) || 0,
      volume: Math.round(metricsData.lastDayVolume * 1000000) || 0, // Add current day volume
      name: basicData.name || '', // Add company name
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        handleApiLimitError();
      }
    }
    console.error('Company Overview API Error:', error);
    return null;
  }
}