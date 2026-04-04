import { Button } from '@/components/ui/Button';
import { AMOUNT_PLACEHOLDER, REQUEST_STATUS } from '@/constants';
import { useFetchBiddingAmounts } from '@/hooks/components/useFetchBiddingAmounts';
import { toTotal } from '@/utils/toTotal';

interface BidButtonProps {
  articleId: number;
  startingPrice: number;
  currentValue: number;
  commissionPercentage: number;
  isLoading: boolean;
  formatter: Intl.NumberFormat;
  onPress: ({ amount }: { amount: number }) => void;
  text: {
    bid?: string;
  };
}

export const BidButton = ({
  articleId,
  currentValue = 0,
  startingPrice = 0,
  commissionPercentage = 0,
  formatter,
  onPress,
  text,
  isLoading,
}: BidButtonProps) => {
  const { data: biddingAmounts, status: biddingAmountsStatus } =
    useFetchBiddingAmounts({
      articleId,
      currentPrice: currentValue,
      startingPrice,
    });

  if (biddingAmountsStatus === REQUEST_STATUS.error) {
    return null;
  }

  const bidAmount = toTotal(
    (biddingAmounts?.tenPercent ?? 0) + currentValue,
    commissionPercentage ?? 0
  );
  const bidAmountFormatter = formatter.format(
    toTotal(
      (biddingAmounts?.tenPercent ?? 0) + currentValue,
      commissionPercentage ?? 0
    )
  );

  const allAmountsReady =
    biddingAmountsStatus === REQUEST_STATUS.success &&
    biddingAmounts?.tenPercent !== undefined &&
    currentValue > 0;

  return (
    <Button
      mode='primary'
      className='w-2/3'
      size='small'
      onPress={() => onPress({ amount: bidAmount ?? 0 })}
      isLoading={isLoading || !allAmountsReady}
    >
      {allAmountsReady
        ? `${text?.bid ?? 'Bid'} ${bidAmountFormatter}`
        : AMOUNT_PLACEHOLDER}
    </Button>
  );
};
