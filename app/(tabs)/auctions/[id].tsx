import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams } from 'expo-router';

export default function AuctionDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        <Text className='mb-2 text-2xl font-bold text-gray-800'>
          {t('screens.auctions.detail')} #{id}
        </Text>
        <Text className='mb-4 text-gray-600'>
          Detalles de la subasta seleccionada
        </Text>

        {/* Placeholder para información de la subasta */}
        <View className='mb-4 rounded-lg bg-gray-100 p-4'>
          <Text className='mb-2 text-lg font-semibold'>
            Título de la Subasta
          </Text>
          <Text className='mb-2 text-gray-600'>Precio actual: $1,250</Text>
          <Text className='mb-2 text-gray-600'>Tiempo restante: 2h 15m</Text>
          <Text className='text-gray-600'>Postores: 12</Text>
        </View>

        <TouchableOpacity
          className='items-center rounded-lg bg-blue-500 p-4'
          onPress={() => console.log('Pujar en subasta')}
        >
          <Text className='text-lg font-semibold text-white'>Pujar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
