import { View, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export function PrivacyPolicyContent() {
  const { t } = useTranslation();

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {t('screens.privacyPolicy.title')}
        </CustomText>
        
        <CustomText
          type='subtitle'
          className='mb-6'
        >
          {t('screens.privacyPolicy.subtitle')}
        </CustomText>

        {/* Sección 1: Información que recopilamos */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.privacyPolicy.section1.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.privacyPolicy.section1.content')}
        </CustomText>

        {/* Sección 2: Cómo usamos la información */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.privacyPolicy.section2.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.privacyPolicy.section2.content')}
        </CustomText>

        {/* Sección 3: Compartir información */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.privacyPolicy.section3.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.privacyPolicy.section3.content')}
        </CustomText>

        {/* Sección 4: Seguridad de los datos */}
        <CustomText
          type='h3'
          className='mb-2 text-black'
        >
          {t('screens.privacyPolicy.section4.title')}
        </CustomText>
        <CustomText
          type='body'
          className='mb-6'
        >
          {t('screens.privacyPolicy.section4.content')}
        </CustomText>

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
