import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

interface EmptyPaymentHistoryProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function EmptyPaymentHistory({
  refreshing,
  onRefresh,
}: EmptyPaymentHistoryProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        contentContainerClassName='flex-1 items-center justify-center px-6'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <CustomText
          type='h1'
          className='mb-4 text-center font-bold'
        >
          {t('screens.paymentsHistory.title')}
        </CustomText>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {t('screens.paymentsHistory.noPaymentsYet')}
        </CustomText>
      </ScrollView>
    </SafeAreaView>
  );
}
