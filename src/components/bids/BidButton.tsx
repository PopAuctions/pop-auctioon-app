import { Button } from '@/components/ui/Button';
import { AMOUNT_PLACEHOLDER } from '@/constants';
import { toTotal } from '@/utils/toTotal';

interface BidButtonProps {
  startingPrice: number;
  currentValue: number;
  bidAmount: number;
  commissionPercentage: number;
  isLoading: boolean;
  formatter: Intl.NumberFormat;
  onPress: ({ amount }: { amount: number }) => void;
  text: {
    bid?: string;
  };
}

export const BidButton = ({
  currentValue = 0,
  startingPrice = 0,
  commissionPercentage = 0,
  formatter,
  onPress,
  text,
  isLoading,
  bidAmount,
}: BidButtonProps) => {
  const effectiveBase = Math.max(currentValue, startingPrice);

  const bidAmountCalculated = toTotal(
    (bidAmount ?? 0) + effectiveBase,
    commissionPercentage ?? 0
  );
  const bidAmountFormatter = formatter.format(bidAmountCalculated);

  const allAmountsReady = startingPrice > 0;

  return (
    <Button
      mode='primary'
      className='w-2/3'
      size='small'
      onPress={() => onPress({ amount: bidAmountCalculated })}
      isLoading={isLoading || !allAmountsReady}
    >
      {allAmountsReady
        ? `${text?.bid ?? 'Puja'} ${bidAmountFormatter}`
        : AMOUNT_PLACEHOLDER}
    </Button>
  );
};
