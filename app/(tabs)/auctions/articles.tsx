import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

// Datos simulados basados en el tercer screenshot
const articlesData = [
  {
    id: '400',
    title: 'tote bag vert',
    brand: 'Bottega Veneta',
    price: '€500',
    currentBid: '€400',
    status: 'Follow',
    image: '👜',
  },
  {
    id: '401',
    title: 'Goya',
    brand: 'Loewe',
    price: '€1,300',
    currentBid: '€1,100',
    status: 'Follow',
    image: '👝',
  },
  {
    id: '402',
    title: 'Bolsa bandolera',
    brand: 'Chanel',
    price: '€800',
    currentBid: '€650',
    status: 'Follow',
    image: '👜',
  },
  {
    id: '403',
    title: 'Mochila Joan',
    brand: 'Marc Jacobs',
    price: '€300',
    currentBid: '€250',
    status: 'Follow',
    image: '🎒',
  },
  {
    id: '404',
    title: 'Loewe Panda Mini Bag',
    brand: 'Loewe',
    price: '€2,100',
    currentBid: '€1,800',
    status: 'Follow',
    image: '👝',
  },
  {
    id: '405',
    title: 'Paris',
    brand: 'Balenciaga',
    price: '€750',
    currentBid: '€600',
    status: 'Follow',
    image: '👜',
  },
];

export default function ArticlesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Bags', 'Accessories', 'Jewelry', 'Watches'];

  const filteredArticles = articlesData.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView className='flex-1 bg-white'>
      {/* Header */}
      <View className='border-b border-gray-200 p-4'>
        <Text className='mb-4 text-2xl font-bold text-gray-800'>Articles</Text>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mb-4'
        >
          <View className='flex-row space-x-2'>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === category ? 'bg-gray-800' : 'bg-gray-100'
                }`}
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
          placeholder='Search articles...'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Articles Grid */}
      <View className='p-4'>
        <View className='flex-row flex-wrap justify-between'>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              className='mb-6 w-[48%] overflow-hidden rounded-lg border border-gray-200 bg-white'
              onPress={() =>
                router.push(`/(tabs)/auctions/article/${article.id}`)
              }
            >
              {/* Article Image */}
              <View className='aspect-square items-center justify-center bg-gray-50'>
                <Text className='text-6xl'>{article.image}</Text>
              </View>

              {/* Article Info */}
              <View className='p-4'>
                <Text className='mb-1 text-sm text-red-500'>
                  {article.brand}
                </Text>
                <Text className='mb-2 text-lg font-light text-gray-900'>
                  {article.title}
                </Text>

                {/* Price Info */}
                <View className='mb-3'>
                  <Text className='text-sm text-gray-500'>
                    CURRENT BID: {article.currentBid}
                  </Text>
                  <Text className='text-sm text-gray-500'>
                    Estimated value: {article.price}
                  </Text>
                </View>

                {/* Follow Button */}
                <TouchableOpacity className='rounded bg-red-500 px-3 py-2'>
                  <Text className='text-center text-sm font-medium text-white'>
                    {article.status}
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
