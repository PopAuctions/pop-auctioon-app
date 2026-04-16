import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/supabase-store';
import { SubscribeStatus } from '@/types/types';

type Options = {
  table: string;
  auctionId: string | number;
  filter?: string;
  enabled?: boolean;
  refetch?: () => void;
};

export const useLiveAuctionSubscription = ({
  table,
  auctionId,
  filter,
  enabled = true,
  refetch,
}: Options) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Include filter in the key so changing it forces a rebind
  const topic = useMemo(
    () => `realtime:${table}:${auctionId}:${filter ?? ''}`,
    [table, auctionId, filter]
  );

  const chRef = useRef<RealtimeChannel | null>(null);

  // ✅ always call the latest refetch (avoid stale closures)
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

    // tear down if we’re switching topic (table/id/filter)
    if (chRef.current && chRef.current.topic !== topic) {
      chRef.current.unsubscribe();
      chRef.current = null;
      setIsSubscribed(false);
    }

    if (chRef.current) return;

    // ✅ do NOT reuse channels from supabase.getChannels()
    const ch = supabase.channel(topic);
    chRef.current = ch;

    ch.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table,
        filter,
      },
      () => {
        refetchRef.current?.();
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
  }, [enabled, topic, table, filter]);

  return { isSubscribed };
};
