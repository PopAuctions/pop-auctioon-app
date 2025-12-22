import { View, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export function CookiesPolicyContent() {
  const { t } = useTranslation();

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {t('screens.cookiesPolicy.title')}
        </CustomText>
        
        <CustomText
          type='subtitle'
          className='mb-6'
        >
          {t('screens.cookiesPolicy.subtitle')}
        </CustomText>

        {/* Sección 1: ¿Qué son las cookies? */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.cookiesPolicy.section1.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.cookiesPolicy.section1.content')}
        </CustomText>

        {/* Sección 2: Tipos de cookies que usamos */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.cookiesPolicy.section2.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.cookiesPolicy.section2.content')}
        </CustomText>

        {/* Sección 3: Gestión de cookies */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.cookiesPolicy.section3.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.cookiesPolicy.section3.content')}
        </CustomText>

        {/* Sección 4: Más información */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.cookiesPolicy.section4.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.cookiesPolicy.section4.content')}
        </CustomText>

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
