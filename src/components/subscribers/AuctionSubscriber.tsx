import { AuctionStatus } from '@/constants/auctions';
import { useAuctionSubscription } from '@/hooks/subscribers/useAuctionSubscription';

export const AuctionSubscriber = ({
  auctionId,
  refetch,
}: {
  auctionId: number;
  refetch?: () => void;
}) => {
  useAuctionSubscription({
    table: 'Auction',
    auctionId: auctionId,
    filter: `id=eq.${auctionId}`,
    compareTo: AuctionStatus.FINISHED,
    refetch: refetch,
  });

  return null;
};
