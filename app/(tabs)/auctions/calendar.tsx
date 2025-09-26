import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuctionsCalendar } from '@/hooks/pages/calendar/useAuctionsCalendar';
import { getCalendarMonths, getMonthName } from '@/utils/calendar';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomLink } from '@/components/ui/CustomLink';

export default function CalendarScreen() {
  const { auctions, status, refetch } = useAuctionsCalendar();
  const { t, locale } = useTranslation();

  // Obtener meses directamente
  const calendarMonths = getCalendarMonths();
  const monthsArray = Array.from(calendarMonths.values()).filter(
    (month) => month.value !== '0'
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
        <Text className='text-gray-600 mt-4'>
          {t('screens.calendar.loading')}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='mb-4 text-center text-red-500'>
          {t('screens.calendar.error')}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className='rounded-lg bg-cinnabar px-4 py-2'
        >
          <Text className='text-white'>{t('screens.calendar.retry')}</Text>
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
            <Text className='text-center font-rubik text-4xl'>
              {t('screens.calendar.thisMonth')}{' '}
              {getMonthName(thisMonth.value, locale)}
            </Text>
            <Text className='mb-4 text-center font-poppins text-xl'>
              {t('screens.calendar.subtitle').toUpperCase()}
            </Text>

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
                            <Image
                              source={{ uri: auction.image }}
                              className='h-full w-full'
                              resizeMode='cover'
                            />
                          ) : (
                            <View className='bg-gray-200 h-full w-full items-center justify-center'>
                              <Text className='text-4xl'>🏺</Text>
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
                                <Text className='font-poppins text-xl uppercase tracking-wide'>
                                  {getMonthName(
                                    new Date(auction.startDate).getMonth() + 1,
                                    locale
                                  ).toUpperCase()}
                                </Text>
                                <Text className='font-poppins text-xl '>
                                  {new Date(auction.startDate).getDate()},{' '}
                                  {new Date(auction.startDate).getFullYear()}
                                </Text>
                              </View>

                              {/* Título justo debajo de la fecha */}
                              <View>
                                <Text className='font-rubik text-2xl '>
                                  {auction.title.toUpperCase()}
                                </Text>
                              </View>
                            </View>

                            {/* Hora - derecha */}
                            <View>
                              <Text className='text-2xl '>
                                {formatTime(auction.startDate)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </CustomLink>
                ))}
              </View>
            ) : (
              <Text className='py-4 text-center font-rubik text-4xl text-cinnabar'>
                {t('screens.calendar.noAuctionsFound')}
              </Text>
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
            <Text className='text-center font-rubik text-4xl'>
              {t('screens.calendar.nextMonth')}{' '}
              {getMonthName(nextMonth.value, locale)}
            </Text>
            <Text className='mb-4 text-center font-poppins text-xl'>
              {t('screens.calendar.subtitle').toUpperCase()}
            </Text>

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
                            <Image
                              source={{ uri: auction.image }}
                              className='h-full w-full'
                              resizeMode='cover'
                            />
                          ) : (
                            <View className='bg-gray-200 h-full w-full items-center justify-center'>
                              <Text className='text-4xl'>🏺</Text>
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
                                <Text className='font-poppins text-xl uppercase tracking-wide'>
                                  {getMonthName(
                                    new Date(auction.startDate).getMonth() + 1,
                                    locale
                                  ).toUpperCase()}
                                </Text>
                                <Text className='font-poppins text-xl '>
                                  {new Date(auction.startDate).getDate()},{' '}
                                  {new Date(auction.startDate).getFullYear()}
                                </Text>
                              </View>

                              {/* Título justo debajo de la fecha */}
                              <View>
                                <Text className='font-rubik text-2xl '>
                                  {auction.title.toUpperCase()}
                                </Text>
                              </View>
                            </View>

                            {/* Hora - derecha */}
                            <View>
                              <Text className='text-2xl'>
                                {formatTime(auction.startDate)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </CustomLink>
                ))}
              </View>
            ) : (
              <Text className='py-4 text-center font-rubik text-4xl text-cinnabar'>
                {t('screens.calendar.noAuctionsFound')}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
