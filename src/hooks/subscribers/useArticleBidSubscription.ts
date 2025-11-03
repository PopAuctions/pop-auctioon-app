import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useHighestBidderContext } from '@/context/highest-bidder-context';
import { supabase } from '@/utils/supabase/supabase-store';

type Options = {
  table: string;
  articleId: string | number;
  filter?: string; // e.g. "articleId=eq.123"
  onFirstBid?: () => void;
  enabled?: boolean;
};

type SubscribeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';

export const useArticleBidSubscription = ({
  table,
  articleId,
  filter,
  onFirstBid,
  enabled = true,
}: Options) => {
  const { setState } = useHighestBidderContext({});
  const [isSubscribed, setIsSubscribed] = useState(false);

  const onFirstBidRef = useRef(onFirstBid);
  useEffect(() => {
    onFirstBidRef.current = onFirstBid;
  }, [onFirstBid]);

  const setStateRef = useRef(setState);
  useEffect(() => {
    setStateRef.current = setState;
  }, [setState]);

  // Include filter in the key so changing it forces a rebind
  const topic = useMemo(
    () => `realtime:${table}:${articleId}:${filter ?? ''}`,
    [table, articleId, filter]
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
        const { new: newData, old: oldData } = payload as {
          new: {
            highestBidderUsername?: string | null;
            highestBidderImage?: string | null;
            currentValue?: number | null;
            available?: boolean | null;
            highestBidderId?: string | null;
          };
          old: { highestBidderId?: string | null };
        };

        setStateRef.current({
          highestBidder: newData.highestBidderUsername ?? null,
          highestBidderImage: newData.highestBidderImage ?? null,
          currentValue: newData.currentValue ?? 0,
          available: newData.available ?? true,
        });

        if (!oldData.highestBidderId && newData.highestBidderId) {
          onFirstBidRef.current?.();
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
  }, [enabled, topic, table, articleId, filter]);

  return { isSubscribed };
};
