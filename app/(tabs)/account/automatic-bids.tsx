import { RefreshControl, ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomError } from '@/components/ui/CustomError';
import { useCallback, useState } from 'react';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { useGetAutoBids } from '@/hooks/pages/auto-bid/useGetAutoBids';
import { AutomaticBidCard } from '@/components/automatic-bids/AutomaticBidCard';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';

export default function AutomaticBidsScreen() {
  const { t, locale } = useTranslation();
  const { data: autoBids, status, errorMessage, refetch } = useGetAutoBids();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (
    status === REQUEST_STATUS.idle ||
    status === REQUEST_STATUS.loading ||
    commissionStatus === REQUEST_STATUS.loading
  ) {
    return <Loading locale={locale} />;
  }

  if (
    status === REQUEST_STATUS.error ||
    autoBids === null ||
    commissionStatus === REQUEST_STATUS.error
  ) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/automatic-bids'
      />
    );
  }

  if (autoBids.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {t('screens.autoBids.noAutoBids')}
        </CustomText>

        <CustomLink
          href='/(tabs)/auctions'
          mode='secondary'
          className='mt-4'
        >
          {t('screens.autoBids.browseArticles')}
        </CustomLink>
      </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className='mt-4 flex flex-col gap-5'>
          {autoBids.map((autoBid) => (
            <AutomaticBidCard
              key={autoBid.id}
              autoBid={autoBid}
              onRefresh={onRefresh}
              commissionAmount={commissionData ?? 0}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
