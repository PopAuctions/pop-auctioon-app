import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// Productos simulados basados en popauctioon.com
const storeProducts = [
  {
    id: '871',
    name: 'collar chanel',
    brand: 'Chanel',
    price: 990,
    image: null,
    category: 'Jewelry',
  },
  {
    id: '872',
    name: 'mochila prada',
    brand: 'Prada',
    price: 1100,
    image: null,
    category: 'Bags',
  },
  {
    id: '873',
    name: 'balenciaga classic city',
    brand: 'Balenciaga',
    price: 1100,
    image: null,
    category: 'Bags',
  },
  {
    id: '874',
    name: 'Carolina Herrera Bowling',
    brand: 'Carolina Herrera',
    price: 490,
    image: null,
    category: 'Bags',
  },
  {
    id: '875',
    name: 'Chloe Marcie',
    brand: 'Chloe',
    price: 650,
    image: null,
    category: 'Bags',
  },
  {
    id: '876',
    name: 'Carolina Herrera',
    brand: 'Carolina Herrera',
    price: 290,
    image: null,
    category: 'Bags',
  },
];

export default function StoreScreen() {
  const renderProduct = ({ item }: { item: (typeof storeProducts)[0] }) => (
    <TouchableOpacity
      className='mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'
      onPress={() => router.push(`/(tabs)/store/${item.id}` as any)}
    >
      {/* Product Image Placeholder */}
      <View className='aspect-square items-center justify-center bg-gray-200'>
        <Text className='text-gray-500'>📷</Text>
      </View>

      {/* Product Info */}
      <View className='p-3'>
        <Text className='mb-1 text-sm font-semibold text-gray-800'>
          {item.name}
        </Text>
        <Text className='mb-2 text-xs text-red-500'>{item.brand}</Text>
        <Text className='text-lg font-bold text-gray-900'>€{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Header - Similar to popauctioon.com */}
      <View className='border-b border-gray-200 bg-white p-4'>
        <Text className='mb-4 text-center text-2xl font-bold text-gray-800'>
          Online Store
        </Text>

        {/* Filter Row */}
        <View className='flex-row items-center justify-between'>
          <View className='flex-row space-x-4'>
            <TouchableOpacity className='rounded border border-gray-300 px-3 py-1'>
              <Text className='text-gray-600'>Model</Text>
            </TouchableOpacity>
            <TouchableOpacity className='rounded border border-gray-300 px-3 py-1'>
              <Text className='text-gray-600'>Code Number</Text>
            </TouchableOpacity>
            <TouchableOpacity className='rounded border border-gray-300 px-3 py-1'>
              <Text className='text-gray-600'>Brand</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className='rounded border border-gray-300 px-3 py-1'>
            <Text className='text-gray-600'>Sort by</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={storeProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
