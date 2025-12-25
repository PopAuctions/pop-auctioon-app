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
          className='mb-6 leading-7'
        >
          {content.intro}
        </CustomText>

        {/* Sections */}
        {content.sections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className='mb-6'
          >
            <CustomText
              type='h2'
              className='mb-3 text-cinnabar'
            >
              {section.title}
            </CustomText>

            {/* Content blocks */}
            {section.content.map((block, blockIndex) => (
              <View
                key={blockIndex}
                className='mb-3'
              >
                {block.text && (
                  <CustomText
                    type='body'
                    className='mb-2 leading-7'
                  >
                    {block.text}
                  </CustomText>
                )}

                {block.children && block.children.length > 0 && (
                  <View className='ml-4'>
                    {block.children.map((item, itemIndex) => (
                      <View
                        key={itemIndex}
                        className='mb-1 flex-row'
                      >
                        <CustomText
                          type='body'
                          className='mr-2'
                        >
                          •
                        </CustomText>
                        <CustomText
                          type='body'
                          className='flex-1 leading-7'
                        >
                          {item}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Outro */}
        <View className='mb-6'>
          <CustomText
            type='h3'
            className='mb-3 text-cinnabar'
          >
            {content.outro.title}
          </CustomText>
          <CustomText
            type='body'
            className='leading-7'
          >
            {content.outro.content}
          </CustomText>
        </View>

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
