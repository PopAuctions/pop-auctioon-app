import { View, ScrollView, Image } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { AboutUsData, Lang } from '@/types/types';

interface AboutUsContentProps {
  data: AboutUsData;
  locale: Lang;
}

export function AboutUsContent({ data, locale }: AboutUsContentProps) {
  const content = data[locale];
  const { t } = useTranslation();

  // Dividir el texto por saltos de línea dobles para párrafos
  const paragraphs = content.text
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        {/* Title */}
        <CustomText
          type='h1'
          className='mb-6 text-center text-cinnabar'
        >
          {t('screens.account.aboutUs')}
        </CustomText>

        {/* Hero Image */}
        <View className='mb-8 overflow-hidden rounded-xl shadow-lg'>
          <Image
            source={require('../../../assets/images/about-hero.webp')}
            className='h-[380px] w-full'
            resizeMode='cover'
          />
        </View>

        {/* Text Content - Párrafos separados */}
        {paragraphs.map((paragraph, index) => (
          <CustomText
            key={index}
            type='body'
            className='mb-5 leading-8'
          >
            {paragraph}
          </CustomText>
        ))}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
