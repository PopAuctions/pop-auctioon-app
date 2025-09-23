import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { CustomAuction } from '@/types/types';

interface AuctionsData {
  today: CustomAuction[];
  this_month: CustomAuction[];
  next_month: CustomAuction[];
}

interface UseAuctionsCalendarReturn {
  auctions: AuctionsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAuctionsCalendar = (): UseAuctionsCalendarReturn => {
  const [auctions, setAuctions] = useState<AuctionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();

      // Start of tomorrow (midnight UTC) - pero queremos incluir hoy también
      const tomorrow = new Date(today);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const formattedTomorrow = tomorrow.toISOString();

      // Last day of the current month (end of day UTC)
      const endOfMonth = new Date(today);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0); // last day of current month
      endOfMonth.setUTCHours(23, 59, 59, 999);
      const formattedEndOfMonth = endOfMonth.toISOString();

      // First day of the next month (midnight UTC)
      const startOfNextMonth = new Date(today);
      startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      startOfNextMonth.setDate(1);
      startOfNextMonth.setUTCHours(0, 0, 0, 0);
      const formattedStartOfNextMonth = startOfNextMonth.toISOString();

      // Last day of the next month (end of day UTC)
      const endOfNextMonth = new Date(startOfNextMonth);
      endOfNextMonth.setMonth(endOfNextMonth.getMonth() + 1);
      endOfNextMonth.setDate(0); // last day of next month
      endOfNextMonth.setUTCHours(23, 59, 59, 999);
      const formattedEndOfNextMonth = endOfNextMonth.toISOString();

      const { data, error: supabaseError } = await supabase.rpc(
        'filter_auctions_for_calendar',
        {
          today: formattedTomorrow,
          start_of_month: formattedTomorrow,
          end_of_month: formattedEndOfMonth,
          start_of_next_month: formattedStartOfNextMonth,
          end_of_next_month: formattedEndOfNextMonth,
          category_param: null,
        }
      );

      if (supabaseError || !data) {
        const errorMessage =
          supabaseError?.message || 'No data returned from calendar RPC';

        // Capturar error en Sentry
        sentryErrorReport(
          supabaseError,
          'USE_AUCTIONS_CALENDAR - RPC filter_auctions_for_calendar failed'
        );

        setError(errorMessage);
        return;
      }

      setAuctions(data as AuctionsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      // Capturar error inesperado en Sentry
      sentryErrorReport(err, 'USE_AUCTIONS_CALENDAR - Unexpected error');

      console.error('Unexpected error fetching auctions:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return {
    auctions,
    loading,
    error,
    refetch: fetchAuctions,
  };
};
