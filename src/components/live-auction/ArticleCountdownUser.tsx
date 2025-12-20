import { useCountdownSubscription } from '@/hooks/subscribers/useCountdownSubscription';
import React, { useCallback, useState } from 'react';
import { ArticleCountdown } from './ArticleCountdown';

export const ArticleCountdownUser = ({
  articleId,
  COUNTDOWN_STEPS,
  autoLive = false,
}: {
  articleId: number;
  COUNTDOWN_STEPS: number;
  autoLive?: boolean;
}) => {
  // const mocked15SecondsLater = new Date(Date.now() + 15 * 1000).toISOString();
  const [currentFinishIso, setCurrentFinishIso] = useState<string>('');

  const handleStart = useCallback(
    (finishIso: string) => setCurrentFinishIso(finishIso),
    []
  );
  // const handleReset = (finishIso: string) => setCurrentFinishIso(finishIso);

  useCountdownSubscription({
    table: `ArticleBid`,
    articleId: articleId,
    updateFinish: handleStart,
    filter: `articleId=eq.${articleId}`,
    autoLive,
  });

  if (!currentFinishIso) return null;

  return (
    <ArticleCountdown
      finishTime={currentFinishIso}
      totalTicks={COUNTDOWN_STEPS}
      onCountdownEnd={() => {}}
    />
  );
};
