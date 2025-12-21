import { useLiveAuctionSubscription } from '@/hooks/subscribers/useLiveAuctionSubscription';

export const LiveAuctionSubscriber = ({
  auctionId,
  refetch,
}: {
  auctionId: number;
  refetch?: () => void;
}) => {
  useLiveAuctionSubscription({
    table: 'LiveAuction',
    auctionId: auctionId,
    filter: `auctionId=eq.${auctionId}`,
    refetch: refetch,
  });

  return null;
};
