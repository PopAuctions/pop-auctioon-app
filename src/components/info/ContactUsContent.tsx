import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export function ContactUsContent() {
  const { t } = useTranslation();

  return (
    <View className='flex-1  '>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-2 text-black'
        >
          {t('screens.contactUs.title')}
        </CustomText>
        <CustomText
          type='subtitle'
          className=''
        >
          {t('screens.contactUs.subtitle')}
        </CustomText>
      </View>
    </View>
  );
}
