import { View, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { PrivacyPolicyData, Lang } from '@/types/types';

interface PrivacyPolicyContentProps {
  data: PrivacyPolicyData;
  locale: Lang;
}

export function PrivacyPolicyContent({
  data,
  locale,
}: PrivacyPolicyContentProps) {
  const content = data[locale];

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {content.title}
        </CustomText>

        {/* Renderizar todas las secciones dinámicamente */}
        {content.sections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className='mb-6'
          >
            <CustomText
              type='h3'
              className='mb-3 text-black'
            >
              {section.title}
            </CustomText>

            {section.content.map((item, itemIndex) => (
              <View
                key={itemIndex}
                className='mb-4'
              >
                {item.subtitle && (
                  <CustomText
                    type='h4'
                    className='mb-2 text-black'
                  >
                    {item.subtitle}
                  </CustomText>
                )}

                {item.content.map((text, textIndex) => (
                  <CustomText
                    key={textIndex}
                    type='body'
                    className='mb-1'
                  >
                    {text}
                  </CustomText>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
