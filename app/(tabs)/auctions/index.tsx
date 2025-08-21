import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';

// Datos simulados de subastas calendarizadas como en popauctioon.com
const upcomingAuctions = [
  { id: '1', title: 'Subasta de Arte Contemporáneo', date: '2025-08-25', time: '19:00', status: 'upcoming' },
  { id: '2', title: 'Antigüedades Europeas', date: '2025-08-27', time: '18:30', status: 'upcoming' },
  { id: '3', title: 'Joyas y Relojes de Lujo', date: '2025-08-30', time: '20:00', status: 'upcoming' },
];

const liveAuction = {
  id: 'live-1',
  title: 'Subasta en Vivo - Colección Especial',
  currentBid: 2450,
  participants: 23,
  timeLeft: '45 min',
};

export default function AuctionsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {t('screens.auctions.title')}
        </Text>
        <Text className="text-gray-600">
          {t('screens.auctions.subtitle')}
        </Text>
      </View>

      {/* Live Auction Banner - Similar to popauctioon.com */}
      <View className="bg-red-500 mx-4 mt-4 rounded-lg p-4 shadow-sm">
        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 bg-white rounded-full mr-2" />
          <Text className="text-white font-bold text-lg">🔴 EN VIVO AHORA</Text>
        </View>
        <Text className="text-white text-xl font-bold mb-2">{liveAuction.title}</Text>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white">Puja actual: ${liveAuction.currentBid}</Text>
          <Text className="text-white">{liveAuction.participants} participantes</Text>
        </View>
        <TouchableOpacity 
          className="bg-white rounded-lg p-3"
          onPress={() => router.push(`/(tabs)/auctions/live/${liveAuction.id}` as any)}
        >
          <Text className="text-red-500 font-bold text-center text-lg">
            UNIRSE A LA SUBASTA EN VIVO
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Section - Upcoming Auctions */}
      <View className="mx-4 mt-6 mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">📅 Próximas Subastas</Text>
        
        {upcomingAuctions.map((auction) => (
          <TouchableOpacity 
            key={auction.id}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
            onPress={() => router.push(`/(tabs)/auctions/${auction.id}` as any)}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  {auction.title}
                </Text>
                <Text className="text-blue-600 font-medium">
                  📅 {auction.date} a las {auction.time}
                </Text>
                <View className="bg-yellow-100 rounded px-2 py-1 mt-2 self-start">
                  <Text className="text-yellow-800 text-xs font-medium">
                    PROGRAMADA
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400">→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Acciones Rápidas</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            className="flex-1 bg-blue-500 rounded-lg p-3"
            onPress={() => router.push('/(tabs)/auctions/calendar' as any)}
          >
            <Text className="text-white font-semibold text-center">📅 Ver Calendario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-gray-500 rounded-lg p-3"
            onPress={() => router.push('/(tabs)/auctions/categories' as any)}
          >
            <Text className="text-white font-semibold text-center">📂 Categorías</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
