import { useLiveAuctionSubscription } from '@/hooks/subscribers/useLiveAuctionSubscription';
import { useIsFocused } from 'expo-router';

export const LiveAuctionSubscriber = ({
  auctionId,
  refetch,
}: {
  auctionId: number;
  refetch?: () => void;
}) => {
  const isFocused = useIsFocused();

  useLiveAuctionSubscription({
    table: 'LiveAuction',
    auctionId: auctionId,
    filter: `auctionId=eq.${auctionId}`,
    refetch: refetch,
    enabled: isFocused,
  });

  return null;
};
