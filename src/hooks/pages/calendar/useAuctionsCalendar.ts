import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { CustomAuction } from '@/types/types';

interface AuctionsData {
  today: CustomAuction[];
  this_month: CustomAuction[];
  next_month: CustomAuction[];
}

type Status = 'loading' | 'loaded' | 'error';

interface UseAuctionsCalendarReturn {
  auctions: AuctionsData | null;
  status: Status;
  refetch: () => Promise<void>;
}

export const useAuctionsCalendar = (): UseAuctionsCalendarReturn => {
  const [auctions, setAuctions] = useState<AuctionsData | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const fetchAuctions = async () => {
    try {
      setStatus('loading');

      const today = new Date();

      // Inicio del mes actual (día 1 a las 00:00:00 UTC)
      const startOfMonth = new Date(today);
      startOfMonth.setDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);
      const formattedStartOfMonth = startOfMonth.toISOString();

      // Final del mes actual (último día a las 23:59:59 UTC)
      const endOfMonth = new Date(today);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0); // último día del mes actual
      endOfMonth.setUTCHours(23, 59, 59, 999);
      const formattedEndOfMonth = endOfMonth.toISOString();

      // Inicio del próximo mes (día 1 a las 00:00:00 UTC)
      const startOfNextMonth = new Date(today);
      startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      startOfNextMonth.setDate(1);
      startOfNextMonth.setUTCHours(0, 0, 0, 0);
      const formattedStartOfNextMonth = startOfNextMonth.toISOString();

      // Final del próximo mes (último día a las 23:59:59 UTC)
      const endOfNextMonth = new Date(startOfNextMonth);
      endOfNextMonth.setMonth(endOfNextMonth.getMonth() + 1);
      endOfNextMonth.setDate(0); // último día del próximo mes
      endOfNextMonth.setUTCHours(23, 59, 59, 999);
      const formattedEndOfNextMonth = endOfNextMonth.toISOString();

      // Para today, usamos desde ahora hacia adelante
      const now = new Date();
      const formattedNow = now.toISOString();

      const { data, error: supabaseError } = await supabase.rpc(
        'filter_auctions_for_calendar',
        {
          today: formattedNow,
          start_of_month: formattedStartOfMonth,
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
          errorMessage,
          'USE_AUCTIONS_CALENDAR - RPC filter_auctions_for_calendar failed'
        );

        setStatus('error');
        return;
      }

      setAuctions(data as AuctionsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      // Capturar error inesperado en Sentry
      sentryErrorReport(err, 'USE_AUCTIONS_CALENDAR - Unexpected error');

      console.error('Unexpected error fetching auctions:', errorMessage);
      setStatus('error');
    } finally {
      setStatus('loaded');
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return {
    auctions,
    status,
    refetch: fetchAuctions,
  };
};
