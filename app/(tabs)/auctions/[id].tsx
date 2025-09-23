import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuctionDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='bg-gray-50 flex-1'
      style={{ paddingTop: insets.top }}
    >
      <ScrollView className='flex-1 bg-white'>
        <View className='p-4'>
          <Text className='text-gray-800 mb-2 text-2xl font-bold'>
            {t('screens.auctions.detail')} #{id}
          </Text>
          <Text className='text-gray-600 mb-4'>
            Detalles de la subasta seleccionada
          </Text>

          {/* Placeholder para información de la subasta */}
          <View className='bg-gray-100 mb-4 rounded-lg p-4'>
            <Text className='mb-2 text-lg font-semibold'>
              Título de la Subasta
            </Text>
            <Text className='text-gray-600 mb-2'>Precio actual: $1,250</Text>
            <Text className='text-gray-600 mb-2'>Tiempo restante: 2h 15m</Text>
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
    </View>
  );
}
