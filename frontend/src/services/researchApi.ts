const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export type PromptType = 'GENERAL_ADVISOR' | 'PORTFOLIO_ADVISOR' | 'NEWS_SUMMARY' | 'WEBSITE_HELP' | 'STOCK_RECOMMENDATIONS';

export interface ResearchResponse {
  response: string;
  source: 'xai' | 'mock';
  error?: string;
}

export async function getResearchResponse(
  message: string,
  promptType: PromptType = 'GENERAL_ADVISOR'
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        promptType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResearchResponse = await response.json();

    if (data.error) {
      console.warn('Research API returned error:', data.error);
    }

    return data.response;
  } catch (error) {
    console.error('Error calling research API:', error);

    // Return a fallback response
    return getFallbackResponse(promptType);
  }
}

function getFallbackResponse(promptType: PromptType): string {
  const fallbackResponses = {
    GENERAL_ADVISOR: "I'm currently unable to provide detailed analysis. Please check back later or consult with a financial advisor for personalized advice.",
    PORTFOLIO_ADVISOR: "Portfolio management requires careful consideration of your financial situation. Consider consulting a certified financial planner for personalized guidance.",
    NEWS_SUMMARY: "Market news and analysis are currently unavailable. Please check financial news sources for the latest updates.",
    WEBSITE_HELP: "I'm here to help you navigate the platform. Feel free to explore the different sections and tools available.",
    STOCK_RECOMMENDATIONS: "Stock analysis requires current market data and comprehensive research. Please use the available tools on this platform for research purposes."
  };

  return fallbackResponses[promptType] || fallbackResponses.GENERAL_ADVISOR;
}

// Wrapper functions for specific use cases
export async function getFinancialAdvice(message: string): Promise<string> {
  return getResearchResponse(message, 'GENERAL_ADVISOR');
}

export async function getPortfolioAdvice(message: string): Promise<string> {
  return getResearchResponse(message, 'PORTFOLIO_ADVISOR');
}

export async function getWebsiteHelp(message: string): Promise<string> {
  return getResearchResponse(message, 'WEBSITE_HELP');
}

export async function getStockNewsSummary(message: string): Promise<string> {
  return getResearchResponse(message, 'NEWS_SUMMARY');
}

export async function getStockRecommendations(message: string): Promise<string> {
  return getResearchResponse(message, 'STOCK_RECOMMENDATIONS');
}