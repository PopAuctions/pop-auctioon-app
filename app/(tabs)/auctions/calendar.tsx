import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuctionsCalendar } from '@/hooks/pages/calendar/useAuctionsCalendar';
import { getCalendarMonths, getMonthName } from '@/utils/calendar';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { AuctionCalendarCard } from '@/components/ui/AuctionCalendarCard';

export default function CalendarScreen() {
  const { auctions, status, refetch } = useAuctionsCalendar();
  const { t, locale } = useTranslation();

  // Obtener meses directamente
  const calendarMonths = getCalendarMonths();
  const monthsArray = Array.from(calendarMonths.values()).filter(
    (month) => month.value !== 0
  );
  const thisMonth = monthsArray[0];
  const nextMonth = monthsArray[1];

  if (status === 'loading') {
    return (
      <View className='flex-1 items-center justify-center  '>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
        <CustomText
          type='body'
          className='text-gray-600 mt-4'
        >
          {t('screens.calendar.loading')}
        </CustomText>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className='flex-1 items-center justify-center   p-4'>
        <CustomText
          type='body'
          className='mb-4 text-center text-red-500'
        >
          {t('screens.calendar.error')}
        </CustomText>
        <TouchableOpacity
          onPress={() => refetch()}
          className='rounded-lg bg-cinnabar px-4 py-2'
        >
          <CustomText type='body'>{t('screens.calendar.retry')}</CustomText>
        </TouchableOpacity>
      </View>
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
    <ScrollView className='flex-1  '>
      <View className='p-4'>
        {auctions?.this_month && (
          <View className='mb-8'>
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

            {auctions.this_month.length > 0 ? (
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
                type='h1'
                className='py-4 text-center text-cinnabar'
              >
                {t('screens.calendar.noAuctionsFound')}
              </CustomText>
            )}
          </View>
        )}

        {/* Línea divisoria entre meses - solo mostrar si hay al menos una sección */}
        {(auctions?.this_month || auctions?.next_month) && (
          <View className='mx-4 my-3'>
            <View className='border-gray-200 w-full border-b' />
          </View>
        )}

        {auctions?.next_month && (
          <View className='mb-8'>
            <CustomText
              type='h1'
              className='text-center'
            >
              {t('screens.calendar.nextMonth')}{' '}
              {getMonthName(nextMonth.value, locale)}
            </CustomText>
            <CustomText
              type='subtitle'
              className='mb-4 text-center'
            >
              {t('screens.calendar.subtitle').toUpperCase()}
            </CustomText>

            {auctions.next_month.length > 0 ? (
              <View className='space-y-6'>
                {auctions.next_month.map((auction) => (
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
                type='h1'
                className='py-4 text-center text-cinnabar'
              >
                {t('screens.calendar.noAuctionsFound')}
              </CustomText>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
