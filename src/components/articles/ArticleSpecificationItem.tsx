import { View } from 'react-native';
import { CustomText } from '../ui/CustomText';
import { Divider } from '../ui/Divider';

export type ArticleSpecificationItemProps = {
  label: string;
  value: string;
  tooltip?: React.ReactNode;
  showDivider?: boolean;
};

export function ArticleSpecificationItem({
  label,
  value,
  tooltip = null,
  showDivider = true,
}: ArticleSpecificationItemProps) {
  return (
    <View className='w-full'>
      <View className='flex-row items-center justify-between'>
        <View className='w-1/2 pr-2'>
          <CustomText type='bodysmall'>{label}</CustomText>
        </View>

        <View className='w-1/2 flex-row flex-wrap items-center justify-start'>
          <CustomText type='bodysmall'>{value || '-'}</CustomText>
          {tooltip ? <View className='ml-1'>{tooltip}</View> : null}
        </View>
      </View>

      {showDivider && <Divider className='my-2' />}
    </View>
  );
}
