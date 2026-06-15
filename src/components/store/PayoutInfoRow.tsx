import { View } from 'react-native';
import { CustomText } from '../ui/CustomText';

export const PayoutInfoRow = ({
  label,

  value,

  strong = false,
}: {
  label: string;

  value: string;

  strong?: boolean;
}) => {
  return (
    <View className='flex-row justify-between gap-4'>
      <CustomText
        type='body'
        className='flex-1 text-gray'
      >
        {label}
      </CustomText>

      <CustomText
        type={strong ? 'bold' : 'body'}
        className='max-w-[55%] text-right'
      >
        {value}
      </CustomText>
    </View>
  );
};
