import { View } from 'react-native';
import type { ReactNode } from 'react';
import { Divider } from '../ui/Divider';
import { CustomText } from '../ui/CustomText';

type ArticleSpecificationItemProps = {
  label: string;
  value: string;
  tooltip?: ReactNode;
};

export function ArticleSpecificationItem({
  label,
  value,
  tooltip = null,
}: ArticleSpecificationItemProps) {
  return (
    <View className='w-full'>
      <View className='flex-row items-center justify-between'>
        <View className='w-1/2 pr-2'>
          <CustomText type='bodysmall'>{label}</CustomText>
        </View>

        <View className='w-1/2 flex-row items-center justify-start'>
          <CustomText type='bodysmall'>{value || '-'}</CustomText>
          {tooltip && <View className='ml-1'>{tooltip}</View>}
        </View>
      </View>

      <Divider className='my-2' />
    </View>
  );
}
