import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import * as Sentry from '@sentry/react-native';
import type { CustomAuction } from '@/types/types';

interface UseSimpleAuctionsReturn {
  auctions: CustomAuction[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSimpleAuctions = (): UseSimpleAuctionsReturn => {
  const [auctions, setAuctions] = useState<CustomAuction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('Auction')
        .select('*')
        .order('startDate', { ascending: true });

      if (supabaseError || !data) {
        const errorMessage =
          supabaseError?.message || 'No data returned from auctions query';

        // Capturar error en Sentry
        Sentry.captureException(
          `[USE_SIMPLE_AUCTIONS] Query failed | ${errorMessage}`
        );

        setError(errorMessage);
        return;
      }

      setAuctions(data as CustomAuction[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      // Capturar error inesperado en Sentry
      Sentry.captureException(
        `[USE_SIMPLE_AUCTIONS] Unexpected error | ${errorMessage}`
      );

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
