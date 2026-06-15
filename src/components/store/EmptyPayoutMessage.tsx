import { View } from 'react-native';
import { CustomText } from '../ui/CustomText';

export const EmptyPayoutMessage = ({ text }: { text: string }) => {
  return (
    <View className='rounded-2xl border border-neutral-200 bg-white p-6'>
      <CustomText
        type='body'
        className='text-center text-gray'
      >
        {text}
      </CustomText>
    </View>
  );
};
