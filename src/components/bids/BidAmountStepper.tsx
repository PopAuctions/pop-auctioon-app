import { Pressable, View } from 'react-native';
import { CustomText } from '../ui/CustomText';

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
  const decreaseDisabled = disabled || !canDecrease;
  const increaseDisabled = disabled || !canIncrease;

  return (
    <View className='mt-2 flex-row items-center gap-2'>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Decrease bid by 10'
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
        accessibilityLabel='Increase bid by 10'
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
