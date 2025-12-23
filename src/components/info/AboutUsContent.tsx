import { View, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { AboutUsData, Lang } from '@/types/types';

interface AboutUsContentProps {
  data: AboutUsData;
  locale: Lang;
}

export function AboutUsContent({ data, locale }: AboutUsContentProps) {
  const content = data[locale];

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='body'
          className='leading-6'
        >
          {content.text}
        </CustomText>

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
