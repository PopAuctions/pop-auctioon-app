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

  // Include filter in the key so changing it forces a rebind
  const topic = useMemo(
    () => `realtime:${table}:${auctionId}:${filter ?? ''}`,
    [table, auctionId, filter]
  );

  const chRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // tear down if we’re switching topic (table/id/filter)
    if (chRef.current && chRef.current.topic !== topic) {
      chRef.current.unsubscribe();
      chRef.current = null;
      setIsSubscribed(false);
    }

    if (chRef.current) return;

    // Reuse existing channel if present (helps Fast Refresh / StrictMode)
    const existing: RealtimeChannel | undefined = supabase
      .getChannels()
      .find((c: RealtimeChannel) => c.topic === topic);

    const ch = existing ?? supabase.channel(topic);
    chRef.current = ch;

    ch.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table,
        filter: filter,
      },
      (payload) => {
        const { new: newData } = payload;

        if (newData.status === compareTo) {
          refetch?.();
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

    if ((ch as any).state === 'joined') setIsSubscribed(true);

    return () => {
      if (chRef.current) {
        chRef.current.unsubscribe();
        chRef.current = null;
      }
      setIsSubscribed(false);
    };
  }, [enabled, topic, table, auctionId, filter, compareTo, refetch]);

  return { isSubscribed };
};
