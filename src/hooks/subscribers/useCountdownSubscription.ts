import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/supabase-store';
import { SubscribeStatus } from '@/types/types';
import { useHighestBidderContext } from '@/context/highest-bidder-context';

type Options = {
  table: string;
  articleId: string | number;
  filter?: string;
  enabled?: boolean;
  updateFinish: (finishIso: string) => void;
  autoLive?: boolean;
};

export const useCountdownSubscription = ({
  table,
  articleId,
  filter,
  enabled = true,
  updateFinish,
  autoLive = false,
}: Options) => {
  const { setState } = useHighestBidderContext({});
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      ({ old: oldData, new: newData }) => {
        const oldFinish = oldData.countdownFinish as string | null;
        const newFinish = newData.countdownFinish as string | null;

        // On initial start
        if (
          !autoLive &&
          newFinish &&
          (!oldFinish || new Date(oldFinish) < new Date(newFinish))
        ) {
          updateFinish(newFinish);
        }

        if (autoLive) {
          const isFirstStart =
            oldData.countdownActive === false &&
            newData.countdownActive === true;
          const isContinuation =
            oldData.countdownActive === true &&
            newData.countdownActive === true;
          let finish = '';

          if (isFirstStart && oldFinish) {
            finish = oldFinish;
          } else if (isContinuation && newFinish) {
            finish = newFinish;
          }

          if (finish) {
            updateFinish(finish);
          }
        }

        // Always propagate bid state
        setState({
          highestBidder: newData.highestBidderUsername,
          highestBidderImage: newData.highestBidderImage,
          currentValue: newData.currentValue,
          available: newData.available,
        });

        // if (!oldData.highestBidderId && newData.highestBidderId) {
        //   safeRefresh(router);
        // }
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
  }, [
    enabled,
    topic,
    table,
    articleId,
    filter,
    updateFinish,
    autoLive,
    setState,
  ]);

  return { isSubscribed };
};
