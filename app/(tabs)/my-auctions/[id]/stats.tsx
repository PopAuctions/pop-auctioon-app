import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AuctionStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView className='flex-1'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-6 text-2xl font-bold'>
          Estadísticas - Subasta #{id}
        </Text>

        {/* Métricas principales */}
        <View className='mb-6 flex-row flex-wrap justify-between'>
          <View
            className='mb-3 rounded-lg bg-blue-100 p-4'
            style={{ width: width * 0.42 }}
          >
            <Text className='text-2xl font-bold text-blue-800'>156</Text>
            <Text className='text-blue-600'>Visitantes</Text>
          </View>

          <View
            className='mb-3 rounded-lg bg-green-100 p-4'
            style={{ width: width * 0.42 }}
          >
            <Text className='text-2xl font-bold text-green-800'>8</Text>
            <Text className='text-green-600'>Total Pujas</Text>
          </View>

          <View
            className='mb-3 rounded-lg bg-purple-100 p-4'
            style={{ width: width * 0.42 }}
          >
            <Text className='text-2xl font-bold text-purple-800'>5</Text>
            <Text className='text-purple-600'>Postores Únicos</Text>
          </View>

          <View
            className='mb-3 rounded-lg bg-orange-100 p-4'
            style={{ width: width * 0.42 }}
          >
            <Text className='text-2xl font-bold text-orange-800'>$245</Text>
            <Text className='text-orange-600'>Puja Más Alta</Text>
          </View>
        </View>

        {/* Historial de pujas */}
        <View className='mb-4 rounded-lg   p-4'>
          <Text className='mb-4 text-lg font-semibold'>Historial de Pujas</Text>
          <View className='space-y-3'>
            <View className='border-gray-100 flex-row items-center justify-between border-b py-2'>
              <View>
                <Text className='font-semibold'>Usuario123</Text>
                <Text className='text-gray-500 text-sm'>hace 15 min</Text>
              </View>
              <Text className='font-bold text-green-600'>$245.00</Text>
            </View>

            <View className='border-gray-100 flex-row items-center justify-between border-b py-2'>
              <View>
                <Text className='font-semibold'>Comprador456</Text>
                <Text className='text-gray-500 text-sm'>hace 1h 30min</Text>
              </View>
              <Text className='font-bold text-green-600'>$230.00</Text>
            </View>

            <View className='border-gray-100 flex-row items-center justify-between border-b py-2'>
              <View>
                <Text className='font-semibold'>PostorXYZ</Text>
                <Text className='text-gray-500 text-sm'>hace 2h 15min</Text>
              </View>
              <Text className='font-bold text-green-600'>$215.00</Text>
            </View>
          </View>
        </View>

        {/* Rendimiento por tiempo */}
        <View className='rounded-lg   p-4'>
          <Text className='mb-4 text-lg font-semibold'>
            Rendimiento por Tiempo
          </Text>
          <View className='space-y-2'>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>Primer día:</Text>
              <Text className='font-semibold'>45 visitantes, 2 pujas</Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>Segundo día:</Text>
              <Text className='font-semibold'>67 visitantes, 4 pujas</Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>Hoy:</Text>
              <Text className='font-semibold'>44 visitantes, 2 pujas</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
