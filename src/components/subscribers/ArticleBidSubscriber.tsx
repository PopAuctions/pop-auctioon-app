import { useCallback } from 'react';
import { useArticleBidSubscription } from '@/hooks/subscribers/useArticleBidSubscription';

export const ArticleBidSubscriber = ({ articleId }: { articleId: number }) => {
  // Optional: memoize if you still choose to pass it
  const handleFirstBid = useCallback(() => {
    console.log({ articleId, message: 'First bid received!' });
    // queryClient.invalidateQueries(['article', articleId]);
  }, [articleId]);

  const { isSubscribed } = useArticleBidSubscription({
    table: 'ArticleBid',
    articleId,
    filter: `articleId=eq.${articleId}`,
    onFirstBid: handleFirstBid,
  });

  console.log({ isSubscribed });

  return null;
};
