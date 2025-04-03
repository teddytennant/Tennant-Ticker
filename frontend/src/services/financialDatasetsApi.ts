import axios from 'axios';

const API_BASE_URL = 'https://api.financialdatasets.ai';
const API_KEY = import.meta.env.VITE_FINANCIAL_DATASETS_API_KEY;
const USE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

let requestCount = 0;
const MAX_REQUESTS = 100;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Mock data structure (adjust based on actual API responses)
const mockStockData = {
  symbol: 'MOCK',
  price: 150.00,
  change: 5.00,
  changePercent: 3.45,
  volume: 1000000,
};

const mockInsightData = {
  symbol: 'MOCK',
  sentiment: 'Positive',
  summary: 'Mock data indicates strong performance based on simulated market conditions.',
  recommendation: 'Buy',
};

const financialDatasetsApi = {
  async getStockData(symbol: string): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('Using mock stock data for:', symbol);
      return { ...mockStockData, symbol };
    }

    if (requestCount >= MAX_REQUESTS) {
      throw new Error('Financial Datasets API request limit reached (100).');
    }

    if (!API_KEY) {
        throw new Error('Financial Datasets API key is missing. Please check your .env file.');
    }

    try {
      requestCount++;
      console.log(`Financial Datasets API requests: ${requestCount}/${MAX_REQUESTS}`);
      // Replace '/stock/{symbol}' with the correct endpoint for fetching stock prices
      const response = await apiClient.get(`/prices`, {
        params: { ticker: symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock data from Financial Datasets API:', (error as any).response ? (error as any).response.data : (error as any).message, 'Request count:', requestCount);
      throw error;
    }
  },

  async getInvestorInsight(symbol: string): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('Using mock investor insight data for:', symbol);
      return { ...mockInsightData, symbol };
    }

    if (requestCount >= MAX_REQUESTS) {
      throw new Error('Financial Datasets API request limit reached (100).');
    }

     if (!API_KEY) {
        throw new Error('Financial Datasets API key is missing. Please check your .env file.');
    }

    try {
      requestCount++;
      console.log(`Financial Datasets API requests: ${requestCount}/${MAX_REQUESTS}`);
      // Update the endpoint for fetching investor insights if needed
      // const response = await apiClient.get(`/prices/snapshot`, {
      //   params: { ticker: symbol }
      // });
      // Replace '/insight/{symbol}' with the actual endpoint from the documentation
      // Add necessary parameters as needed
      const response = await apiClient.get(`/insight/${symbol}`); // Adjust endpoint as needed
      return response.data;
    } catch (error) {
      console.error('Error fetching investor insight from Financial Datasets API:', error);
      throw error;
    }
  },

  // Add other API methods as needed based on the documentation

  getRequestCount(): number {
    return requestCount;
  },

  resetRequestCount(): void {
    requestCount = 0;
    console.log('Financial Datasets API request count reset.');
  }
};

export default financialDatasetsApi;
