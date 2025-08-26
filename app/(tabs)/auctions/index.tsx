import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuctionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='flex-1 bg-gray-50'
      style={{ paddingTop: insets.top }}
    >
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='border-b border-gray-200 bg-white p-4'>
          <Text className='mb-2 text-2xl font-bold text-gray-800'>
            {t('screens.auctions.title')}
          </Text>
          <Text className='text-gray-600'>
            Explora subastas programadas y artículos disponibles
          </Text>
        </View>

        {/* Live Auction Banner */}
        <View className='mx-4 mt-4'>
          <TouchableOpacity
            className='rounded-lg bg-red-500 p-6 shadow-lg'
            onPress={() => router.push('/(tabs)/auctions/live/123')}
          >
            <View className='flex-row items-center justify-center'>
              <View className='mr-3 h-3 w-3 animate-pulse rounded-full bg-white' />
              <Text className='mr-2 text-xl font-bold text-white'>
                🔴 SUBASTA EN VIVO
              </Text>
            </View>
            <Text className='mt-2 text-center text-white opacity-90'>
              ¡Únete ahora a la subasta activa!
            </Text>
            <View className='mt-3 flex-row justify-center space-x-4'>
              <Text className='text-sm text-white opacity-80'>
                ⏱️ 45:20 restante
              </Text>
              <Text className='text-sm text-white opacity-80'>
                👥 23 participantes
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Options */}
        <View className='space-y-4 p-4'>
          {/* Auctions Calendar Option */}
          <TouchableOpacity
            className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
            onPress={() => router.push('/(tabs)/auctions/calendar')}
          >
            <View className='mb-3 flex-row items-center'>
              <Text className='mr-4 text-4xl'>📅</Text>
              <View className='flex-1'>
                <Text className='mb-1 text-xl font-bold text-gray-800'>
                  Calendario de Subastas
                </Text>
                <Text className='text-gray-600'>
                  Ver todas las subastas programadas por fecha
                </Text>
              </View>
              <Text className='text-2xl text-gray-400'>→</Text>
            </View>
          </TouchableOpacity>

          {/* All Articles Option */}
          <TouchableOpacity
            className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
            onPress={() => router.push('/(tabs)/auctions/articles')}
          >
            <View className='mb-3 flex-row items-center'>
              <Text className='mr-4 text-4xl'>🏷️</Text>
              <View className='flex-1'>
                <Text className='mb-1 text-xl font-bold text-gray-800'>
                  All Articles
                </Text>
                <Text className='text-gray-600'>
                  Explorar todos los artículos disponibles
                </Text>
              </View>
              <Text className='text-2xl text-gray-400'>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View className='mx-4 mb-4'>
          <View className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
            <Text className='mb-2 font-semibold text-orange-800'>
              📊 Estadísticas
            </Text>
            <View className='flex-row justify-between'>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-orange-600'>12</Text>
                <Text className='text-sm text-orange-700'>
                  Subastas Activas
                </Text>
              </View>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-orange-600'>450</Text>
                <Text className='text-sm text-orange-700'>Artículos</Text>
              </View>
              <View className='items-center'>
                <Text className='text-2xl font-bold text-orange-600'>1.2k</Text>
                <Text className='text-sm text-orange-700'>Participantes</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
