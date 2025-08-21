import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Bags', 'Jewelry'];

  const getProductIcon = (category: string) => {
    switch (category) {
      case 'Bags':
        return '👜';
      case 'Jewelry':
        return '💎';
      default:
        return '🛍️';
    }
  };

  const filteredProducts = storeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView
      className='flex-1 bg-white'
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className='border-b border-gray-200 p-4'>
        <Text className='mb-4 text-2xl font-bold text-gray-800'>
          Online Store
        </Text>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mb-4'
        >
          <View className='flex-row'>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === category ? 'bg-gray-800' : 'bg-gray-100'
                } ${index > 0 ? 'ml-4' : ''}`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  className={`${
                    selectedCategory === category
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search Bar */}
        <TextInput
          className='rounded-lg border border-gray-200 bg-gray-50 p-3'
          placeholder='Search products...'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Products Grid */}
      <View className='p-4'>
        <View className='flex-row flex-wrap justify-between'>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              className='mb-6 w-[48%] overflow-hidden rounded-lg border border-gray-200 bg-white'
              onPress={() => router.push(`/(tabs)/store/${product.id}` as any)}
            >
              {/* Product Image */}
              <View className='aspect-square items-center justify-center bg-gray-50'>
                <Text className='text-6xl'>
                  {getProductIcon(product.category)}
                </Text>
              </View>

              {/* Product Info */}
              <View className='flex-1 justify-between p-4'>
                <View>
                  <Text className='mb-1 text-sm text-red-500'>
                    {product.brand}
                  </Text>
                  <Text className='mb-2 text-lg font-light text-gray-900'>
                    {product.name}
                  </Text>

                  {/* Price Info */}
                  <View className='mb-3'>
                    <Text className='text-sm text-gray-500'>
                      PRICE: €{product.price}
                    </Text>
                    <Text className='text-sm text-gray-500'>
                      Category: {product.category}
                    </Text>
                  </View>
                </View>

                {/* Buy Button */}
                <TouchableOpacity className='rounded bg-green-500 px-3 py-2'>
                  <Text className='text-center text-sm font-medium text-white'>
                    Buy Now
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
