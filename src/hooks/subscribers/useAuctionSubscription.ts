import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/supabase-store';
import { SubscribeStatus } from '@/types/types';

type Options = {
  table: string;
  auctionId: string | number;
  filter?: string;
  compareTo: string;
  enabled?: boolean;
  refetch?: () => void;
};

export const useAuctionSubscription = ({
  table,
  auctionId,
  filter,
  compareTo,
  enabled = true,
  refetch,
}: Options) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const topic = useMemo(
    () => `realtime:${table}:${auctionId}:${filter ?? ''}`,
    [table, auctionId, filter]
  );

  const chRef = useRef<RealtimeChannel | null>(null);

  // ✅ always call latest refetch (prevents stale closures too)
  const refetchRef = useRef<(() => void) | undefined>(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    // ✅ if disabled, tear down any existing channel
    if (!enabled) {
      if (chRef.current) {
        chRef.current.unsubscribe();
        chRef.current = null;
      }
      setIsSubscribed(false);
      return;
    }

    // tear down if switching topic
    if (chRef.current && chRef.current.topic !== topic) {
      chRef.current.unsubscribe();
      chRef.current = null;
      setIsSubscribed(false);
    }

    if (chRef.current) return;

    const ch = supabase.channel(topic);
    chRef.current = ch;

    ch.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table, filter },
      (payload) => {
        const { new: newData } = payload;
        if (newData?.status === compareTo) {
          refetchRef.current?.();
        }
      }
    ).subscribe((status: SubscribeStatus) => {
      if (status === 'SUBSCRIBED') setIsSubscribed(true);
      if (
        status === 'CLOSED' ||
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT'
      ) {
        setIsSubscribed(false);
      }
    });

    return () => {
      chRef.current?.unsubscribe();
      chRef.current = null;
      setIsSubscribed(false);
    };
  }, [enabled, topic, table, filter, compareTo]);

  return { isSubscribed };
};
