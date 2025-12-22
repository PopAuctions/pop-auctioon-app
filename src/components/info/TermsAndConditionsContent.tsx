import { View, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export function TermsAndConditionsContent() {
  const { t } = useTranslation();

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {t('screens.termsAndConditions.title')}
        </CustomText>
        
        <CustomText
          type='subtitle'
          className='mb-6'
        >
          {t('screens.termsAndConditions.subtitle')}
        </CustomText>

        {/* Sección 1: Aceptación de los términos */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.termsAndConditions.section1.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.termsAndConditions.section1.content')}
        </CustomText>

        {/* Sección 2: Uso del servicio */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.termsAndConditions.section2.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.termsAndConditions.section2.content')}
        </CustomText>

        {/* Sección 3: Responsabilidades del usuario */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.termsAndConditions.section3.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.termsAndConditions.section3.content')}
        </CustomText>

        {/* Sección 4: Limitaciones de responsabilidad */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.termsAndConditions.section4.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.termsAndConditions.section4.content')}
        </CustomText>

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
