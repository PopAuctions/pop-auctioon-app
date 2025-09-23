import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomLink } from '@/components/ui/CustomLink';

export default function AuctionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='bg-gray-50 flex-1'
      style={{ paddingTop: insets.top }}
    >
      <ScrollView className='flex-1'>
        {/* Header */}
        <View className='border-gray-200 border-b bg-white p-4'>
          <Text className='text-gray-800 mb-2 text-2xl font-bold'>
            {t('screens.auctions.title')}
          </Text>
          <Text className='text-gray-600'>
            Explora subastas programadas y artículos disponibles
          </Text>
        </View>

        {/* Live Auction Banner */}
        <View className='mx-4 mt-4'>
          <CustomLink
            href='/(tabs)/auctions/live/123'
            mode='empty'
            className='rounded-lg bg-red-500 p-6 shadow-lg'
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
          </CustomLink>
        </View>

        {/* Main Options */}
        <View className='space-y-4 p-4'>
          {/* Auctions Calendar Option */}
          <CustomLink
            href='/(tabs)/auctions/calendar'
            mode='empty'
            className='border-gray-200 rounded-lg border bg-white p-6 shadow-sm'
          >
            <View className='mb-3 flex-row items-center'>
              <Text className='mr-4 text-4xl'>📅</Text>
              <View className='flex-1'>
                <Text className='text-gray-800 mb-1 text-xl font-bold'>
                  Calendario de Subastas
                </Text>
                <Text className='text-gray-600'>
                  Ver todas las subastas programadas por fecha
                </Text>
              </View>
              <Text className='text-gray-400 text-2xl'>→</Text>
            </View>
          </CustomLink>

          {/* All Articles Option */}
          <CustomLink
            href='/(tabs)/auctions/articles'
            mode='empty'
            className='border-gray-200 rounded-lg border bg-white p-6 shadow-sm'
          >
            <View className='mb-3 flex-row items-center'>
              <Text className='mr-4 text-4xl'>🏷️</Text>
              <View className='flex-1'>
                <Text className='text-gray-800 mb-1 text-xl font-bold'>
                  All Articles
                </Text>
                <Text className='text-gray-600'>
                  Explorar todos los artículos disponibles
                </Text>
              </View>
              <Text className='text-gray-400 text-2xl'>→</Text>
            </View>
          </CustomLink>
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
