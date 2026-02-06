import { AuctionStatus } from '@/constants/auctions';
import { useAuctionSubscription } from '@/hooks/subscribers/useAuctionSubscription';
import { useIsFocused } from '@react-navigation/native';

export const AuctionSubscriber = ({
  auctionId,
  refetch,
  compareTo,
}: {
  auctionId: number;
  refetch?: () => void;
  compareTo: AuctionStatus;
}) => {
  const isFocused = useIsFocused();

  useAuctionSubscription({
    table: 'Auction',
    auctionId,
    filter: `id=eq.${auctionId}`,
    compareTo,
    refetch,
    enabled: isFocused,
  });

  return null;
};
