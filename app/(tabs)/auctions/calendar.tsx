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
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';

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
      <View className='flex-1 items-center justify-center bg-white'>
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
      <View className='flex-1 items-center justify-center bg-white p-4'>
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
    <ScrollView className='flex-1 bg-white'>
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
                  <CustomLink
                    key={auction.id}
                    href={`/(tabs)/auctions/${auction.id}`}
                    mode='empty'
                  >
                    <View className='overflow-hidden rounded-xl bg-white shadow-sm'>
                      <View className='min-h-[220px] flex-row py-6 '>
                        {/* Imagen grande a la izquierda */}
                        <View className='bg-gray-100 mr-6 h-64 w-52 overflow-hidden rounded-lg'>
                          {auction.image && auction.image.trim() !== '' ? (
                            <CustomImage
                              src={auction.image}
                              alt={auction.title || 'Auction image'}
                              className='h-full w-full'
                              resizeMode='cover'
                            />
                          ) : (
                            <View className='bg-gray-200 h-full w-full items-center justify-center'>
                              <CustomText type='h1'>🏺</CustomText>
                            </View>
                          )}
                        </View>

                        {/* Grid de contenido a la derecha */}
                        <View className='flex-1 py-2'>
                          {/* Layout principal: Fecha y Hora */}
                          <View className='flex-row items-start justify-between'>
                            {/* Columna izquierda: Fecha y Título */}
                            <View className='mr-4 flex-1'>
                              {/* Fecha */}
                              <View className='mb-2'>
                                <CustomText
                                  type='subtitle'
                                  className=''
                                >
                                  {getMonthName(
                                    new Date(auction.startDate).getMonth() + 1,
                                    locale
                                  ).toUpperCase()}
                                </CustomText>
                                <CustomText
                                  type='h4'
                                  className=''
                                >
                                  {new Date(auction.startDate).getDate()},{' '}
                                  {new Date(auction.startDate).getFullYear()}
                                </CustomText>
                              </View>

                              {/* Título justo debajo de la fecha */}
                              <View>
                                <CustomText
                                  type='h3'
                                  className=''
                                >
                                  {auction.title.toUpperCase()}
                                </CustomText>
                              </View>
                            </View>

                            {/* Hora - derecha */}
                            <View>
                              <CustomText
                                type='h3'
                                className=''
                              >
                                {formatTime(auction.startDate)}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </CustomLink>
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
                  <CustomLink
                    key={auction.id}
                    href={`/(tabs)/auctions/${auction.id}`}
                    mode='empty'
                  >
                    <View className='overflow-hidden rounded-xl bg-white shadow-sm'>
                      <View className='min-h-[220px] flex-row py-6 '>
                        {/* Imagen grande a la izquierda */}
                        <View className='bg-gray-100 mr-6 h-64 w-52 overflow-hidden rounded-lg'>
                          {auction.image && auction.image.trim() !== '' ? (
                            <CustomImage
                              src={auction.image}
                              alt={auction.title || 'Auction image'}
                              className='h-full w-full'
                              resizeMode='cover'
                            />
                          ) : (
                            <View className='bg-gray-200 h-full w-full items-center justify-center'>
                              <CustomText
                                type='h1'
                                className='text-4xl'
                              >
                                🏺
                              </CustomText>
                            </View>
                          )}
                        </View>

                        {/* Grid de contenido a la derecha */}
                        <View className='flex-1 py-2'>
                          {/* Layout principal: Fecha y Hora */}
                          <View className='flex-row items-start justify-between'>
                            {/* Columna izquierda: Fecha y Título */}
                            <View className='mr-4 flex-1'>
                              {/* Fecha */}
                              <View className='mb-2'>
                                <CustomText
                                  type='subtitle'
                                  className=''
                                >
                                  {getMonthName(
                                    new Date(auction.startDate).getMonth() + 1,
                                    locale
                                  ).toUpperCase()}
                                </CustomText>
                                <CustomText
                                  type='h4'
                                  className=''
                                >
                                  {new Date(auction.startDate).getDate()},{' '}
                                  {new Date(auction.startDate).getFullYear()}
                                </CustomText>
                              </View>

                              {/* Título justo debajo de la fecha */}
                              <View>
                                <CustomText
                                  type='h3'
                                  className=''
                                >
                                  {auction.title.toUpperCase()}
                                </CustomText>
                              </View>
                            </View>

                            {/* Hora - derecha */}
                            <View>
                              <CustomText
                                type='h3'
                                className=''
                              >
                                {formatTime(auction.startDate)}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </CustomLink>
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
