import { RefreshControl, ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { useGetOffersMade } from '@/hooks/pages/offers-made/useGetOffersMade';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomError } from '@/components/ui/CustomError';
import { useCallback, useState } from 'react';
import { OfferCard } from '@/components/offers/OfferCard';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';

export default function OffersMadeScreen() {
  const { t, locale } = useTranslation();
  const { data: offers, status, errorMessage, refetch } = useGetOffersMade();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || offers === null) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/offers-made'
      />
    );
  }

  if (offers.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {t('screens.myOffers.noOffersMade')}
        </CustomText>
        <CustomLink
          href='/(tabs)/online-store'
          mode='secondary'
          className='mt-4'
        >
          {t('screens.myOffers.goToOnlineStore')}
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
        {/* Payment cards list */}
        <View className='mt-4 flex flex-col gap-4'>
          {offers.map((offer) => (
            <OfferCard
              lang={locale}
              key={offer.id}
              offer={offer}
              texts={{
                alreadySold: t('screens.myOffers.alreadySold'),
                payNow: t('screens.myOffers.payNow'),
                offerExpired: t('screens.myOffers.offerExpired'),
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
