import { useCountdownSubscription } from '@/hooks/subscribers/useCountdownSubscription';
import React, { useState } from 'react';
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
  // Current finish ISO time
  const mockedOnemMinuteLater = new Date(Date.now() + 60 * 1000).toISOString();
  const [currentFinishIso, setCurrentFinishIso] = useState<string>(
    mockedOnemMinuteLater
  );

  const handleStart = (finishIso: string) => setCurrentFinishIso(finishIso);
  // const handleReset = (finishIso: string) => setCurrentFinishIso(finishIso);

  useCountdownSubscription({
    table: `article_countdown_${articleId}`,
    articleId: articleId,
    updateFinish: handleStart,
    filter: `articleId=eq.${articleId}`,
    autoLive,
  });

  // if (!currentFinishIso) return null;

  return (
    <ArticleCountdown
      finishTime={currentFinishIso}
      totalTicks={COUNTDOWN_STEPS}
      onCountdownEnd={() => {}}
    />
  );
};
