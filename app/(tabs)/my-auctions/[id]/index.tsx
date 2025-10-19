import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

export default function MyAuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { navigateWithAuth } = useAuthNavigation();

  return (
    <ScrollView className='flex-1'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-2 text-2xl font-bold'>
          Mi Subasta #{id}
        </Text>

        {/* Estado de la subasta */}
        <View className='mb-4 rounded-lg bg-green-100 p-4'>
          <Text className='font-semibold text-green-800'>Estado: Activa</Text>
          <Text className='text-green-700'>Tiempo restante: 5h 30m</Text>
        </View>

        {/* Información de la subasta */}
        <View className='bg-gray-100 mb-4 rounded-lg p-4'>
          <Text className='mb-2 text-lg font-semibold'>
            Información General
          </Text>
          <Text className='text-gray-600 mb-1'>
            Título: Producto de Ejemplo
          </Text>
          <Text className='text-gray-600 mb-1'>Precio inicial: $100.00</Text>
          <Text className='text-gray-600 mb-1'>Puja actual: $245.00</Text>
          <Text className='text-gray-600 mb-1'>Número de pujas: 8</Text>
          <Text className='text-gray-600'>Visitantes: 156</Text>
        </View>

        {/* Pujas recientes */}
        <View className='bg-gray-100 mb-6 rounded-lg p-4'>
          <Text className='mb-2 text-lg font-semibold'>Pujas Recientes</Text>
          <View className='space-y-2'>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>Usuario123</Text>
              <Text className='font-semibold'>$245.00</Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>Comprador456</Text>
              <Text className='font-semibold'>$230.00</Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-600'>PostorXYZ</Text>
              <Text className='font-semibold'>$215.00</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View className='space-y-3'>
          <TouchableOpacity
            className='items-center rounded-lg bg-blue-500 p-4'
            onPress={() => navigateWithAuth(`/(tabs)/my-auctions/${id}/edit`)}
          >
            <Text className='text-lg font-semibold text-white'>
              Editar Subasta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='items-center rounded-lg bg-green-500 p-4'
            onPress={() => navigateWithAuth(`/(tabs)/my-auctions/${id}/stats`)}
          >
            <Text className='text-lg font-semibold text-white'>
              Ver Estadísticas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='items-center rounded-lg bg-red-500 p-4'
            onPress={() => console.log('Finalizar subasta')}
          >
            <Text className='text-lg font-semibold text-white'>
              Finalizar Subasta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
