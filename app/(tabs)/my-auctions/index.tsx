import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';

// Subastas del auctioneer - con diferentes estados
const myAuctions = [
  {
    id: '1',
    title: 'Colección de Arte Moderno',
    currentBid: 1245,
    status: 'live',
    timeLeft: '2h 15m',
    participants: 8,
    items: 12,
  },
  {
    id: '2',
    title: 'Antigüedades Victorianas',
    currentBid: 850,
    status: 'scheduled',
    timeLeft: 'Inicia en 2 días',
    participants: 0,
    items: 7,
  },
  {
    id: '3',
    title: 'Joyas Vintage',
    finalPrice: 2100,
    status: 'completed',
    timeLeft: 'Finalizada',
    participants: 15,
    items: 5,
  },
  {
    id: '4',
    title: 'Instrumentos Musicales',
    currentBid: 350,
    status: 'draft',
    timeLeft: 'Borrador',
    participants: 0,
    items: 3,
  },
];

export default function MyAuctionsScreen() {
  const { t } = useTranslation();
  const { navigateWithAuth } = useAuthNavigation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return '🔴 EN VIVO';
      case 'scheduled':
        return '📅 PROGRAMADA';
      case 'completed':
        return '✅ FINALIZADA';
      case 'draft':
        return '📝 BORRADOR';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <SafeAreaView
      className='bg-gray-50 flex-1'
      edges={['top']}
    >
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='border-gray-200 border-b bg-white p-4'>
          <Text className='text-gray-800 mb-2 text-2xl font-bold'>
            {t('screens.myAuctions.title')}
          </Text>
          <Text className='text-gray-600 mb-4'>
            Gestiona todas tus subastas desde aquí
          </Text>
          <TouchableOpacity
            className='rounded-lg bg-blue-500 p-3'
            onPress={() => navigateWithAuth('/(tabs)/my-auctions/create')}
          >
            <Text className='text-center font-semibold text-white'>
              ➕ {t('screens.myAuctions.createAuction')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Overview */}
        <View className='mx-4 mt-4 rounded-lg bg-white p-4 shadow-sm'>
          <Text className='text-gray-800 mb-3 text-lg font-semibold'>
            📊 Resumen
          </Text>
          <View className='flex-row justify-between'>
            <View className='items-center'>
              <Text className='text-2xl font-bold text-blue-600'>4</Text>
              <Text className='text-gray-600 text-sm'>Subastas</Text>
            </View>
            <View className='items-center'>
              <Text className='text-2xl font-bold text-green-600'>1</Text>
              <Text className='text-gray-600 text-sm'>En Vivo</Text>
            </View>
            <View className='items-center'>
              <Text className='text-2xl font-bold text-orange-600'>$4,545</Text>
              <Text className='text-gray-600 text-sm'>Total Ventas</Text>
            </View>
          </View>
        </View>

        {/* Auctions List */}
        <View className='mx-4 mb-6 mt-4'>
          {myAuctions.map((auction) => (
            <TouchableOpacity
              key={auction.id}
              className='border-gray-200 mb-3 rounded-lg border bg-white p-4 shadow-sm'
              onPress={() =>
                navigateWithAuth(`/(tabs)/my-auctions/${auction.id}`)
              }
            >
              <View className='mb-3 flex-row items-start justify-between'>
                <View className='flex-1'>
                  <Text className='text-gray-800 mb-1 text-lg font-semibold'>
                    {auction.title}
                  </Text>
                  <Text className='text-gray-600'>
                    📦 {auction.items} artículos • 👥 {auction.participants}{' '}
                    participantes
                  </Text>
                </View>
                <View
                  className={`rounded px-2 py-1 ${getStatusColor(auction.status)}`}
                >
                  <Text className='text-xs font-medium'>
                    {getStatusText(auction.status)}
                  </Text>
                </View>
              </View>

              <View className='flex-row items-center justify-between'>
                <View>
                  {auction.status === 'completed' ? (
                    <Text className='text-lg font-bold text-green-600'>
                      Vendido: ${auction.finalPrice?.toLocaleString()}
                    </Text>
                  ) : auction.status === 'draft' ? (
                    <Text className='text-gray-500'>{auction.timeLeft}</Text>
                  ) : (
                    <>
                      <Text className='font-medium text-blue-600'>
                        Puja actual: ${auction.currentBid?.toLocaleString()}
                      </Text>
                      <Text className='text-gray-500'>{auction.timeLeft}</Text>
                    </>
                  )}
                </View>
                <Text className='text-gray-400'>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
