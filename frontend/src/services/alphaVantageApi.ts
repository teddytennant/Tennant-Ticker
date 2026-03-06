const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export async function searchStocks(
  query: string
): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/quote/${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (data.error) {
      return [];
    }
    return [
      {
        symbol: data.symbol || query.toUpperCase(),
        name: data.shortName || query.toUpperCase(),
      },
    ];
  } catch {
    return [];
  }
}

export async function getTechnicalIndicatorsAV(
  symbol: string
): Promise<{ rsi: number | null; macd: number | null; sma50: number | null; sma200: number | null }> {
  // Technical indicators are not available from the current backend.
  // Return nulls so the UI gracefully hides indicator sections.
  return { rsi: null, macd: null, sma50: null, sma200: null };
}

export async function getDetailedStockDataAV(symbol: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/quote/${encodeURIComponent(symbol)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch detailed data for ${symbol}`);
  }
  return response.json();
}

export async function getCompetitorDataAV(symbol: string): Promise<unknown[]> {
  return [];
}
