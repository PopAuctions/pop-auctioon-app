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
        {/* <Text className='text-gray-900 mb-6 text-center text-3xl font-bold'>
          {t('screens.calendar.title')}
        </Text> */}

        {auctions?.this_month && auctions.this_month.length > 0 && (
          <View className='mb-8'>
            <Text className='text-center font-rubik text-4xl'>
              {t('screens.calendar.thisMonth')}{' '}
              {getMonthName(thisMonth.value, locale)}
            </Text>
            <Text className='mb-4 text-center font-poppins text-xl'>
              {t('screens.calendar.subtitle').toUpperCase()}
            </Text>

            <View className='space-y-6'>
              {auctions.this_month.map((auction) => (
                <TouchableOpacity
                  key={auction.id}
                  className='overflow-hidden rounded-xl bg-white shadow-sm'
                >
                  <View className='min-h-[180px] flex-row py-6 '>
                    {/* Imagen grande a la izquierda */}
                    <View className='bg-gray-100 mr-6 h-56 w-44 overflow-hidden rounded-lg'>
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
                      {/* Fila superior: Fecha y Hora alineadas */}
                      <View className='mb-4 flex-row items-start justify-between'>
                        {/* Fecha en formato mes - izquierda */}
                        <View>
                          <Text className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                            {getMonthName(
                              new Date(auction.startDate).getMonth() + 1,
                              locale
                            ).toUpperCase()}
                          </Text>
                          <Text className='text-2xl font-bold'>
                            {new Date(auction.startDate).getDate()},{' '}
                            {new Date(auction.startDate).getFullYear()}
                          </Text>
                        </View>

                        {/* Hora - derecha */}
                        <View>
                          <Text className='text-2xl font-bold'>
                            {formatTime(auction.startDate)}
                          </Text>
                        </View>
                      </View>

                      {/* Título de la subasta abajo */}
                      <View className='flex-1 justify-end'>
                        <Text
                          className='text-xl font-bold'
                          numberOfLines={2}
                        >
                          {auction.title}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Línea divisoria entre meses */}
        <View className='mx-4 my-6'>
          <View className='border-gray-200 w-full border-b' />
        </View>

        {auctions?.next_month && auctions.next_month.length > 0 && (
          <View className='mb-8'>
            <Text className='text-center font-rubik text-4xl'>
              {t('screens.calendar.nextMonth')}{' '}
              {getMonthName(nextMonth.value, locale)}
            </Text>
            <Text className='mb-4 text-center font-poppins text-xl'>
              {t('screens.calendar.subtitle').toUpperCase()}
            </Text>

            <View className='space-y-6'>
              {auctions.next_month.map((auction) => (
                <TouchableOpacity
                  key={auction.id}
                  className='overflow-hidden rounded-xl bg-white shadow-sm'
                >
                  <View className='min-h-[180px] flex-row p-6'>
                    {/* Imagen grande a la izquierda */}
                    <View className='bg-gray-100 mr-6 h-40 w-36 overflow-hidden rounded-lg'>
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
                      {/* Fila superior: Fecha y Hora alineadas */}
                      <View className='mb-4 flex-row items-start justify-between'>
                        {/* Fecha en formato mes - izquierda */}
                        <View>
                          <Text className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                            {getMonthName(
                              new Date(auction.startDate).getMonth() + 1,
                              locale
                            ).toUpperCase()}
                          </Text>
                          <Text className='text-2xl font-bold'>
                            {new Date(auction.startDate).getDate()},{' '}
                            {new Date(auction.startDate).getFullYear()}
                          </Text>
                        </View>

                        {/* Hora - derecha */}
                        <View>
                          <Text className='text-2xl font-bold'>
                            {formatTime(auction.startDate)}
                          </Text>
                        </View>
                      </View>

                      {/* Título de la subasta abajo */}
                      <View className='flex-1 justify-end'>
                        <Text
                          className='text-xl font-bold'
                          numberOfLines={2}
                        >
                          {auction.title}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Mostrar mensaje cuando no hay subastas en un mes específico */}
        {auctions?.this_month && auctions.this_month.length === 0 && (
          <View className='mb-8'>
            <Text className=' mb-4 text-xl font-bold'>
              {t('screens.calendar.auctionsIn')}{' '}
              {getMonthName(thisMonth.value, locale)}
            </Text>
            <Text className='py-8 text-center text-lg text-cinnabar'>
              {t('screens.calendar.noAuctionsFound')}
            </Text>
          </View>
        )}

        {auctions?.next_month && auctions.next_month.length === 0 && (
          <View className='mb-8'>
            <Text className=' mb-4 text-xl font-bold'>
              {t('screens.calendar.auctionsIn')}{' '}
              {getMonthName(nextMonth.value, locale)}
            </Text>
            <Text className='py-8 text-center text-lg text-cinnabar'>
              {t('screens.calendar.noAuctionsFound')}
            </Text>
          </View>
        )}

        {/* Mensaje general cuando no hay datos */}
        {!auctions?.this_month && !auctions?.next_month && (
          <View className='items-center py-8'>
            <Text className='mb-2 text-lg font-semibold text-cinnabar'>
              {t('screens.calendar.noAuctionsFound')}
            </Text>
            <Text className=' text-center'>
              {t('screens.calendar.checkBackLater')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
