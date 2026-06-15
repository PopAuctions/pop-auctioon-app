import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomError } from '@/components/ui/CustomError';
import { Loading } from '@/components/ui/Loading';
import { ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { REQUEST_STATUS } from '@/constants';
import { useGetAuctioneerPayoutDashboard } from '@/hooks/pages/store/useGetAuctioneerPayoutDashboard';
import { View } from '@/components/Themed';
import { AuctioneerPayoutDashboard } from '@/components/store/AuctioneerPayoutDashboard';

export default function MyStorePayoutsScreen() {
  const { locale, t } = useTranslation();

  const { data, status, errorMessage } = useGetAuctioneerPayoutDashboard();

  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !data) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/auctioneer/my-store/payouts'
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
          {t('screens.store.payoutsDashboard.title')}
        </CustomText>

        <CustomText
          type='body'
          className='mt-2 text-center text-gray'
        >
          {t('screens.store.payoutsDashboard.description')}
        </CustomText>

        <View className='mt-6'>
          <AuctioneerPayoutDashboard dashboard={data} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
