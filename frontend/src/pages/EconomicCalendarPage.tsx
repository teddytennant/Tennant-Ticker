import React, { useState, useEffect } from 'react';
import { getEconomicCalendar, EconomicEvent } from '../services/economicCalendarApi'; // Import EconomicEvent from service
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
// Removed imports for missing Table, Badge, Skeleton components
import { format, parseISO } from 'date-fns'; // Import date-fns for formatting


const EconomicCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEconomicCalendar();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch economic events:", err);
        setError('Failed to load economic events. Please check console for details or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Fetch on initial mount

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      console.error("Failed to format date:", dateString, e);
      return dateString;
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title="Upcoming Events" description="Key upcoming events relevant to your investments" />

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-10">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}
          {!error && (
            <div>
              {loading ? (
                <p className="text-center py-10">Loading events...</p>
              ) : events.length > 0 ? (
                <ul className="space-y-3">
                  {events.map((event, index) => (
                    <li key={index} className="p-3 border rounded-md shadow-sm bg-card text-card-foreground">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{event.event}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(event.date)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>Country: <span className="font-medium">{event.country}</span></div>
                        <div>Impact: <span className="font-medium">{event.impact}</span></div>
                        <div>Actual: <span className="font-medium">{event.actual !== null ? event.actual.toFixed(2) : '-'}</span></div>
                        <div>Estimate: <span className="font-medium">{event.estimate !== null ? event.estimate.toFixed(2) : '-'}</span></div>
                        <div>Previous: <span className="font-medium">{event.previous !== null ? event.previous.toFixed(2) : '-'}</span></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  No economic events found for the current period.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicCalendarPage;
