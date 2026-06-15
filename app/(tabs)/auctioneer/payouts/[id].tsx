import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorePayoutDetail } from '@/components/store/StorePayoutDetail';
import { CustomError } from '@/components/ui/CustomError';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetStorePayoutById } from '@/hooks/pages/store/useGetStorePayoutById';

export default function StorePayoutDetailScreen() {
  const { locale, t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const payoutId = id;

  const { data, status, errorMessage } = useGetStorePayoutById({ payoutId });

  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !data) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute={`/(tabs)/auctioneer/my-store/payouts/${payoutId}`}
      />
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-6 py-6'
      >
        <CustomText
          type='h2'
          className='text-center'
        >
          {t('screens.storeSettlements.payoutDetail')}
        </CustomText>

        <View className='mt-6'>
          <StorePayoutDetail payout={data} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
