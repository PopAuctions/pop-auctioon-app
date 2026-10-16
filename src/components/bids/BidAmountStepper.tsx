import { Pressable, View } from 'react-native';
import { CustomText } from '../ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';

type BidAmountStepperProps = {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export const BidAmountStepper = ({
  value,
  placeholder = '...',
  disabled = false,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: BidAmountStepperProps) => {
  const { t } = useTranslation();
  const decreaseDisabled = disabled || !canDecrease;
  const increaseDisabled = disabled || !canIncrease;

  return (
    <View className='mt-2 flex-row items-center gap-2'>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('commonUi.accessibility.decreaseBidByTen')}
        disabled={decreaseDisabled}
        onPress={onDecrease}
        className={`h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white ${
          decreaseDisabled ? 'opacity-40' : 'active:bg-neutral-100'
        }`}
      >
        <CustomText
          type='bodysmall'
          className='text-xl font-semibold text-black'
        >
          −
        </CustomText>
      </Pressable>

      <View className='h-10 flex-1 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50 px-3'>
        <CustomText
          type='bodysmall'
          className='text-base font-medium text-black'
        >
          {value || placeholder}
        </CustomText>
      </View>

      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('commonUi.accessibility.increaseBidByTen')}
        disabled={increaseDisabled}
        onPress={onIncrease}
        className={`h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white ${
          increaseDisabled ? 'opacity-40' : 'active:bg-neutral-100'
        }`}
      >
        <CustomText
          type='bodysmall'
          className='text-xl font-semibold text-black'
        >
          +
        </CustomText>
      </Pressable>
    </View>
  );
};
