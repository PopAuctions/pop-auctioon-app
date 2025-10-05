import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export default function PaymentsHistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='flex-1 bg-white'
      style={{ paddingTop: insets.top }}
    >
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
