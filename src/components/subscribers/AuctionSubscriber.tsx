import { AuctionStatus } from '@/constants/auctions';
import { useAuctionSubscription } from '@/hooks/subscribers/useAuctionSubscription';
import { useIsFocused } from '@react-navigation/native';

export const AuctionSubscriber = ({
  auctionId,
  refetch,
}: {
  auctionId: number;
  refetch?: () => void;
}) => {
  const isFocused = useIsFocused();

  useAuctionSubscription({
    table: 'Auction',
    auctionId,
    filter: `id=eq.${auctionId}`,
    compareTo: AuctionStatus.FINISHED,
    refetch,
    enabled: isFocused,
  });

  return null;
};
