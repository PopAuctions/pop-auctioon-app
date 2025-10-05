import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export default function PaymentsHistoryScreen() {
  const { t } = useTranslation();

  return (
    <View className='flex-1 bg-white'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-2  text-black'
        >
          {t('screens.paymentsHistory.title')}
        </CustomText>
        <CustomText
          type='subtitle'
          className=''
        >
          {t('screens.paymentsHistory.subtitle')}
        </CustomText>
      </View>
    </View>
  );
}
