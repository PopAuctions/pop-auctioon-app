import React from 'react';
import { View, ScrollView } from 'react-native';
import { useAuctionsCalendar } from '@/hooks/pages/calendar/useAuctionsCalendar';
import { getCalendarMonths, getMonthName } from '@/utils/calendar';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { AuctionCalendarCard } from '@/components/ui/AuctionCalendarCard';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';
import { Divider } from '@/components/ui/Divider';

export default function IndexScreen() {
  const { data: auctions, status } = useAuctionsCalendar();
  const { t, locale } = useTranslation();

  // Obtener meses directamente
  const calendarMonths = getCalendarMonths();
  const monthsArray = Array.from(calendarMonths.values()).filter(
    (month) => month.value !== 0
  );
  const thisMonth = monthsArray[0];
  const nextMonth = monthsArray[1];
  const hasAuctionsNextMonth = auctions?.next_month?.length > 0 || false;

  if (status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={{
          es: 'No se pudieron cargar las subastas.',
          en: 'Failed to load auctions.',
        }}
        refreshRoute='/(tabs)/auctions'
      />
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-4'>
        <CustomText
          type='h1'
          className='text-center'
        >
          {t('screens.calendar.thisMonth')}{' '}
          {getMonthName(thisMonth.value, locale)}
        </CustomText>
        <CustomText
          type='subtitle'
          className='mb-4 text-center'
        >
          {t('screens.calendar.subtitle').toUpperCase()}
        </CustomText>

        {auctions?.this_month && auctions.this_month.length > 0 ? (
          <View className='space-y-6'>
            {auctions.this_month.map((auction) => (
              <AuctionCalendarCard
                key={auction.id}
                auction={auction}
                locale={locale}
                formatTime={formatTime}
              />
            ))}
          </View>
        ) : (
          <CustomText
            type='h2'
            className='py-4 text-center text-cinnabar'
          >
            {t('screens.calendar.noAuctionsFound')}
          </CustomText>
        )}

        {hasAuctionsNextMonth && (
          <>
            <Divider className='my-4' />

            <View className='mb-8'>
              <CustomText
                type='h1'
                className='text-center'
              >
                {t('screens.calendar.nextMonth')}{' '}
                {getMonthName(nextMonth.value, locale)}
              </CustomText>

              <View className='space-y-6'>
                {auctions?.next_month &&
                  auctions.next_month.map((auction) => (
                    <AuctionCalendarCard
                      key={auction.id}
                      auction={auction}
                      locale={locale}
                      formatTime={formatTime}
                    />
                  ))}
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
