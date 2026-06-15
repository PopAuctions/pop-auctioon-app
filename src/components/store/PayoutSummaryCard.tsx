import { View } from 'react-native';
import { CustomText } from '../ui/CustomText';

export const PayoutSummaryCard = ({
  label,

  value,
}: {
  label: string;

  value: string;
}) => {
  return (
    <View className='rounded-2xl border border-neutral-200 bg-white p-4'>
      <CustomText
        type='body'
        className='text-gray'
      >
        {label}
      </CustomText>

      <CustomText
        type='h3'
        className='mt-1'
      >
        {value}
      </CustomText>
    </View>
  );
};
