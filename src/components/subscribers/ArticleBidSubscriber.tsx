import { useArticleBidSubscription } from '@/hooks/subscribers/useArticleBidSubscription';

export const ArticleBidSubscriber = ({
  articleId,
  onFirstBid,
}: {
  articleId: number;
  onFirstBid: (currentValue: number) => void;
}) => {
  useArticleBidSubscription({
    table: 'ArticleBid',
    articleId,
    filter: `articleId=eq.${articleId}`,
    onFirstBid,
  });

  return null;
};
