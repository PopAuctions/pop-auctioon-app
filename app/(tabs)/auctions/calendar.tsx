import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const calendarData = [
  {
    date: '2025-08-25',
    auctions: [
      {
        id: '1',
        title: 'Subasta de Arte Contemporáneo',
        time: '19:00',
        type: 'Arte',
      },
    ],
  },
  {
    date: '2025-08-27',
    auctions: [
      {
        id: '2',
        title: 'Antigüedades Europeas',
        time: '18:30',
        type: 'Antigüedades',
      },
      { id: '3', title: 'Colección Vintage', time: '20:00', type: 'Vintage' },
    ],
  },
  {
    date: '2025-08-30',
    auctions: [
      {
        id: '4',
        title: 'Joyas y Relojes de Lujo',
        time: '20:00',
        type: 'Joyas',
      },
    ],
  },
];

export default function AuctionCalendarScreen() {
  return (
    <ScrollView className='bg-gray-50 flex-1'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-6 text-2xl font-bold'>
          📅 Calendario de Subastas
        </Text>

        {calendarData.map((day, index) => (
          <View
            key={day.date}
            className='mb-6'
          >
            {/* Date Header */}
            <View className='rounded-t-lg bg-blue-500 p-3'>
              <Text className='text-lg font-bold text-white'>
                {new Date(day.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            {/* Auctions for that date */}
            <View className='border-gray-200 rounded-b-lg border-b border-l border-r bg-white'>
              {day.auctions.map((auction) => (
                <TouchableOpacity
                  key={auction.id}
                  className='border-gray-100 border-b p-4 last:border-b-0'
                  onPress={() =>
                    router.push(`/(tabs)/auctions/${auction.id}` as any)
                  }
                >
                  <View className='flex-row items-center justify-between'>
                    <View className='flex-1'>
                      <Text className='text-gray-800 mb-1 text-lg font-semibold'>
                        {auction.title}
                      </Text>
                      <Text className='font-medium text-blue-600'>
                        🕒 {auction.time}
                      </Text>
                      <View className='bg-gray-100 mt-2 self-start rounded px-2 py-1'>
                        <Text className='text-gray-700 text-xs font-medium'>
                          {auction.type}
                        </Text>
                      </View>
                    </View>
                    <Text className='text-gray-400'>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className='mt-4 rounded-lg bg-blue-50 p-4'>
          <Text className='mb-2 font-semibold text-blue-800'>💡 Consejo</Text>
          <Text className='text-blue-700'>
            Configura notificaciones para no perderte ninguna subasta. Puedes
            registrarte con anticipación para participar.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
