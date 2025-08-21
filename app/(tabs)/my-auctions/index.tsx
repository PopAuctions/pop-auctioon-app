import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';

// Subastas del auctioneer - con diferentes estados
const myAuctions = [
  { 
    id: '1', 
    title: 'Colección de Arte Moderno', 
    currentBid: 1245, 
    status: 'live', 
    timeLeft: '2h 15m',
    participants: 8,
    items: 12
  },
  { 
    id: '2', 
    title: 'Antigüedades Victorianas', 
    currentBid: 850, 
    status: 'scheduled', 
    timeLeft: 'Inicia en 2 días',
    participants: 0,
    items: 7
  },
  { 
    id: '3', 
    title: 'Joyas Vintage', 
    finalPrice: 2100, 
    status: 'completed', 
    timeLeft: 'Finalizada',
    participants: 15,
    items: 5
  },
  { 
    id: '4', 
    title: 'Instrumentos Musicales', 
    currentBid: 350, 
    status: 'draft', 
    timeLeft: 'Borrador',
    participants: 0,
    items: 3
  },
];

export default function MyAuctionsScreen() {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return '🔴 EN VIVO';
      case 'scheduled': return '📅 PROGRAMADA';
      case 'completed': return '✅ FINALIZADA';
      case 'draft': return '📝 BORRADOR';
      default: return status.toUpperCase();
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {t('screens.myAuctions.title')}
        </Text>
        <Text className="text-gray-600 mb-4">
          Gestiona todas tus subastas desde aquí
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 rounded-lg p-3"
          onPress={() => router.push('/(tabs)/my-auctions/create' as any)}
        >
          <Text className="text-white font-semibold text-center">
            ➕ {t('screens.myAuctions.createAuction')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Overview */}
      <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-3">📊 Resumen</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">4</Text>
            <Text className="text-gray-600 text-sm">Subastas</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">1</Text>
            <Text className="text-gray-600 text-sm">En Vivo</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">$4,545</Text>
            <Text className="text-gray-600 text-sm">Total Ventas</Text>
          </View>
        </View>
      </View>

      {/* Auctions List */}
      <View className="mx-4 mt-4 mb-6">
        {myAuctions.map((auction) => (
          <TouchableOpacity 
            key={auction.id}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
            onPress={() => router.push(`/(tabs)/my-auctions/${auction.id}` as any)}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  {auction.title}
                </Text>
                <Text className="text-gray-600">
                  📦 {auction.items} artículos • 👥 {auction.participants} participantes
                </Text>
              </View>
              <View className={`px-2 py-1 rounded ${getStatusColor(auction.status)}`}>
                <Text className="text-xs font-medium">
                  {getStatusText(auction.status)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View>
                {auction.status === 'completed' ? (
                  <Text className="text-green-600 font-bold text-lg">
                    Vendido: ${auction.finalPrice?.toLocaleString()}
                  </Text>
                ) : auction.status === 'draft' ? (
                  <Text className="text-gray-500">
                    {auction.timeLeft}
                  </Text>
                ) : (
                  <>
                    <Text className="text-blue-600 font-medium">
                      Puja actual: ${auction.currentBid?.toLocaleString()}
                    </Text>
                    <Text className="text-gray-500">{auction.timeLeft}</Text>
                  </>
                )}
              </View>
              <Text className="text-gray-400">→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
