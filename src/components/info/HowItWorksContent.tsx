import { View, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { HowItWorksData, Lang } from '@/types/types';

interface HowItWorksContentProps {
  data: HowItWorksData;
  locale: Lang;
}

export function HowItWorksContent({ data, locale }: HowItWorksContentProps) {
  const content = data[locale];

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        {/* Intro */}
        <CustomText
          type='body'
          className='mb-6 leading-6'
        >
          {content.intro}
        </CustomText>

        {/* Sections */}
        {content.sections.map((section, index) => (
          <View
            key={index}
            className='mb-6'
          >
            <CustomText
              type='h3'
              className='mb-3 text-cinnabar'
            >
              {section.subtitle}
            </CustomText>
            <CustomText
              type='body'
              className='leading-6'
            >
              {section.text}
            </CustomText>
          </View>
        ))}

        {/* Outro */}
        <CustomText
          type='body'
          className='leading-6'
        >
          {content.outro}
        </CustomText>

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
