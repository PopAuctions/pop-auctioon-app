import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const categories = [
  { id: '1', name: 'Arte', count: 45 },
  { id: '2', name: 'Antigüedades', count: 23 },
  { id: '3', name: 'Electrónicos', count: 67 },
  { id: '4', name: 'Joyas', count: 34 },
  { id: '5', name: 'Coleccionables', count: 56 },
  { id: '6', name: 'Moda', count: 28 },
];

export default function AuctionCategoriesScreen() {
  const renderCategory = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      className='mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
      onPress={() => console.log(`Navegating to category: ${item.name}`)}
    >
      <View className='flex-row items-center justify-between'>
        <Text className='text-lg font-semibold text-gray-800'>{item.name}</Text>
        <Text className='text-gray-500'>{item.count} subastas</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-gray-50'>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
