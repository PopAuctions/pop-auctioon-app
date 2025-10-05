import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export default function VerifyPhoneScreen() {
  const { t } = useTranslation();

  return (
    <View className='flex-1 bg-white'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-2 text-black'
        >
          {t('screens.verifyPhone.title')}
        </CustomText>
        <CustomText
          type='subtitle'
          className='text-gray-600'
        >
          {t('screens.verifyPhone.subtitle')}
        </CustomText>
      </View>
    </View>
  );
}
