import { View, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { FAQsData, Lang } from '@/types/types';

interface FAQsContentProps {
  data: FAQsData;
  locale: Lang;
}

export function FAQsContent({ data, locale }: FAQsContentProps) {
  const content = data[locale];

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        {content.map((category, categoryIndex) => (
          <View
            key={categoryIndex}
            className='mb-6'
          >
            {/* Category subtitle */}
            <CustomText
              type='h2'
              className='mb-4 text-cinnabar'
            >
              {category.subtitle}
            </CustomText>

            {/* Questions */}
            {category.questions.map((item, questionIndex) => (
              <View
                key={questionIndex}
                className='mb-4'
              >
                <CustomText
                  type='h4'
                  className='mb-2 text-black'
                >
                  {item.question}
                </CustomText>
                <CustomText
                  type='body'
                  className='leading-6'
                >
                  {item.answer}
                </CustomText>
              </View>
            ))}
          </View>
        ))}

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
