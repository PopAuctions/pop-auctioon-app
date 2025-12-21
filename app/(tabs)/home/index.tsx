import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { UpcomingAuctionsSection } from '@/components/home/UpcomingAuctions';
import { useFetchUpcomingAuctions } from '@/hooks/pages/auction/useFetchUpcomingAuctions';
import { REQUEST_STATUS } from '@/constants';

export default function HomeScreen() {
  const { t, locale } = useTranslation();
  const { data: upcomingAuctions, status: upcomingAuctionsStatus } =
    useFetchUpcomingAuctions();

  return (
    <SafeAreaView
      className='flex-1'
      edges={['top']}
    >
      <ScrollView className='flex-1 px-4'>
        <UpcomingAuctionsSection
          auctions={upcomingAuctions}
          locale={locale}
          isLoading={upcomingAuctionsStatus === REQUEST_STATUS.loading}
          texts={{
            title: t('screens.homePage.upcomingAuctionsTitle'),
            noAuction: t('screens.homePage.noAuctions'),
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
