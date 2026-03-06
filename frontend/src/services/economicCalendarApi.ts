export interface EconomicEvent {
  event: string;
  date: string;
  country: string;
  impact: string;
  actual: number | null;
  estimate: number | null;
  previous: number | null;
}

export async function getEconomicCalendar(): Promise<EconomicEvent[]> {
  // The backend does not currently provide an economic calendar endpoint.
  // Return an empty array so the page renders without errors.
  console.warn('Economic calendar API is not yet implemented on the backend.');
  return [];
}
