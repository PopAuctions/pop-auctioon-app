import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CustomLink } from '@/components/ui/CustomLink';
import { useAuctionsCalendar } from '@/hooks/useAuctionsCalendar';
import { useCalendarMonths } from '@/hooks/useCalendarMonths';

export default function CalendarScreen() {
  const { auctions, loading, error, refetch } = useAuctionsCalendar();
  const { thisMonth, nextMonth } = useCalendarMonths();

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size='large' color='#d75639' />
        <Text className='mt-4 text-gray-600'>Cargando subastas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='mb-4 text-center text-red-500'>
          Error al cargar las subastas: {error}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className='rounded-lg bg-cinnabar px-4 py-2'
        >
          <Text className='text-white'>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-6 text-2xl font-bold'>
          Calendario de Subastas
        </Text>

        {auctions?.this_month && auctions.this_month.length > 0 && (
          <View className='mb-8'>
            <Text className='text-gray-800 mb-4 text-xl font-bold'>
              Subastas de {thisMonth.es}
            </Text>
            <Text className='text-gray-600 mb-4 text-sm'>
              No te pierdas nada!
            </Text>

            <View className='space-y-4'>
              {auctions.this_month.map((auction) => (
                <CustomLink
                  key={auction.id}
                  href={'/(tabs)/auctions/' + auction.id}
                  mode='empty'
                  className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
                >
                  <View className='flex-row'>
                    <View className='mr-4 h-20 w-16 overflow-hidden rounded-lg bg-gray-100'>
                      {auction.image ? (
                        <View className='flex-1 items-center justify-center'>
                          <Text className='text-2xl'></Text>
                        </View>
                      ) : (
                        <View className='flex-1 items-center justify-center'>
                          <Text className='text-gray-400 text-xs'>Sin imagen</Text>
                        </View>
                      )}
                    </View>

                    <View className='flex-1'>
                      <Text className='text-gray-800 mb-1 text-lg font-semibold'>
                        {auction.title}
                      </Text>
                      <Text className='font-medium text-blue-600'>
                        {formatDate(auction.startDate)}
                      </Text>
                      <Text className='font-medium text-blue-600'>
                        {formatTime(auction.startDate)}
                      </Text>
                    </View>

                    <Text className='text-gray-400'></Text>
                  </View>
                </CustomLink>
              ))}
            </View>
          </View>
        )}

        {auctions?.next_month && auctions.next_month.length > 0 && (
          <View className='mb-8'>
            <Text className='text-gray-800 mb-4 text-xl font-bold'>
              Subastas de {nextMonth.es}
            </Text>
            <Text className='text-gray-600 mb-4 text-sm'>
              No te pierdas nada!
            </Text>

            <View className='space-y-4'>
              {auctions.next_month.map((auction) => (
                <CustomLink
                  key={auction.id}
                  href={'/(tabs)/auctions/' + auction.id}
                  mode='empty'
                  className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
                >
                  <View className='flex-row'>
                    <View className='mr-4 h-20 w-16 overflow-hidden rounded-lg bg-gray-100'>
                      {auction.image ? (
                        <View className='flex-1 items-center justify-center'>
                          <Text className='text-2xl'></Text>
                        </View>
                      ) : (
                        <View className='flex-1 items-center justify-center'>
                          <Text className='text-gray-400 text-xs'>Sin imagen</Text>
                        </View>
                      )}
                    </View>

                    <View className='flex-1'>
                      <Text className='text-gray-800 mb-1 text-lg font-semibold'>
                        {auction.title}
                      </Text>
                      <Text className='font-medium text-blue-600'>
                        {formatDate(auction.startDate)}
                      </Text>
                      <Text className='font-medium text-blue-600'>
                        {formatTime(auction.startDate)}
                      </Text>
                    </View>

                    <Text className='text-gray-400'></Text>
                  </View>
                </CustomLink>
              ))}
            </View>
          </View>
        )}

        {(!auctions?.this_month || auctions.this_month.length === 0) &&
          (!auctions?.next_month || auctions.next_month.length === 0) && (
            <View className='items-center py-8'>
              <Text className='text-cinnabar mb-2 text-lg font-semibold'>
                No hay subastas programadas
              </Text>
              <Text className='text-gray-600 text-center'>
                Mantente al tanto, nuevas subastas serán agregadas pronto.
              </Text>
            </View>
          )}

      </View>
    </ScrollView>
  );
}
