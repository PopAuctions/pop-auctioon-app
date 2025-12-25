import { View, ScrollView, Pressable, Linking } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import type { TermsAndConditionsData, Lang } from '@/types/types';

interface TermsAndConditionsContentProps {
  data: TermsAndConditionsData;
  locale: Lang;
}

export function TermsAndConditionsContent({
  data,
  locale,
}: TermsAndConditionsContentProps) {
  const { t } = useTranslation();
  const { callToast } = useToast(locale);

  const handleOpenPDF = async () => {
    const supported = await Linking.canOpenURL(data.pdfUrl);

    if (supported) {
      await Linking.openURL(data.pdfUrl);
    } else {
      callToast({
        variant: 'error',
        description: {
          es: 'No se pudo abrir el documento PDF',
          en: 'Could not open PDF document',
        },
      });
    }
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-black'
        >
          {t('screens.account.termsAndConditions')}
        </CustomText>

        <CustomText
          type='subtitle'
          className='mb-6'
        >
          {t('screens.account.termsAndConditionsDescription')}
        </CustomText>

        {/* Botón para abrir PDF */}
        <Pressable
          onPress={handleOpenPDF}
          className='mb-6 flex-row items-center justify-between rounded-lg bg-cinnabar px-6 py-4 active:opacity-80'
        >
          <View className='flex-row items-center gap-3'>
            <FontAwesomeIcon
              variant='bold'
              name='file-text'
              size={24}
              color='#ffffff'
            />
            <CustomText
              type='h3'
              className='text-white'
            >
              {t('screens.account.openPDF')}
            </CustomText>
          </View>
          <FontAwesomeIcon
            variant='bold'
            name='chevron-right'
            size={16}
            color='#ffffff'
          />
        </Pressable>

        <CustomText
          type='bodysmall'
          className='text-gray-600'
        >
          {t('screens.account.pdfWillOpen')}
        </CustomText>

        {/* Espacio adicional al final */}
        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
