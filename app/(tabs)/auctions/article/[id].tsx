import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Datos simulados basados en el cuarto screenshot (Goya bag)
const getArticleData = (id: string) => {
  const articles: any = {
    '400': {
      title: 'Goya',
      brand: 'Loewe',
      date: 'AUGUST 31, 2025',
      time: '6:00 PM',
      estimatedPrice: '€1,300',
      images: 4,
      details: {
        Model: 'Goya',
        Brand: 'Loewe',
        Material: 'Leather',
        Condition: 'Very Good/Excelente',
        Size: 'Medium',
        Color: 'Blue',
        'Code Internal': 'G23-4567',
      },
      description: `Bolso Goya en cuero azul marino con logotipo dorado.
      
Magnifica extraordinaria, el bolso Goya es uno de los modelos mas emblemáticos de la firma española. Confeccionado en cuero azul con su característico anagrama dorado que hace referencia a las vanguardias artísticas como una oda al arte pictórico Velazquez y en especial Goya.

Piezas muy apreciadas en el mundo de los bolsos de segunda mano.
Material: Cuero napa
Forro: Suave textil natural
Color: azul marino/dorado 
Tamaño: Mediano

Producto: EM STOCK - LISTOS PARA SUBASTA
Referencia: 95765-90948
Ultima posesion es ejercicio de bolsos valorado mas en el uso del articulo.
Una pieza esencial si no queremos perdemos el ejercicio de bolsos para subastarmos.Tenemos para quadrarremos inmedia.`,
      observations: 'NO OBSERVATIONS',
    },
  };
  return articles[id] || articles['400'];
};

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bid, setBid] = useState('');

  const article = getArticleData(id || '400');

  return (
    <ScrollView className='flex-1'>
      {/* Header with Auction Info */}
      <View className='border-gray-200 border-b   p-4'>
        <Text className='mb-2 text-sm text-red-500'>Follow auction to:</Text>
        <Text className='text-gray-900 mb-2 text-2xl font-light'>
          {article.title}
        </Text>
        <Text className='text-gray-600 text-sm'>
          {article.date} · {article.time}
        </Text>
        <Text className='mt-1 text-sm text-red-500'>Lote live in 25m 33s</Text>

        <View className='mt-4 flex-row space-x-2'>
          <TouchableOpacity className='rounded bg-red-500 px-4 py-2'>
            <Text className='text-sm font-medium text-white'>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity className='border-gray-300 rounded border px-4 py-2'>
            <Text className='text-gray-700 text-sm'>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className='flex-row'>
        {/* Left Side - Images */}
        <View className='w-1/2'>
          {/* Main Image */}
          <View className='border-gray-200 bg-gray-100 aspect-square items-center justify-center border-r'>
            <Text className='text-8xl'>👝</Text>
          </View>

          {/* Image Thumbnails */}
          <View className='border-gray-200 flex-row border-r'>
            {Array.from({ length: article.images }).map((_, index) => (
              <TouchableOpacity
                key={index}
                className={`border-gray-200 aspect-square flex-1 items-center justify-center border-t ${
                  index > 0 ? 'border-gray-200 border-l' : ''
                } ${currentImageIndex === index ? 'bg-blue-50' : ''}`}
                onPress={() => setCurrentImageIndex(index)}
              >
                <Text className='text-2xl'>👝</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Right Side - Details */}
        <View className='w-1/2 p-4'>
          {/* Price Section */}
          <View className='mb-6'>
            <Text className='text-gray-600 mb-1 text-sm'>Highest bid</Text>
            <Text className='text-gray-900 text-3xl font-light'>
              {article.estimatedPrice}
            </Text>
            <Text className='text-gray-500 text-sm'>
              Estimated value: €1,800
            </Text>
          </View>

          {/* Bid Input */}
          <View className='mb-6 rounded bg-orange-50 p-4'>
            <Text className='text-gray-700 mb-2 text-sm'>Maximum bid is:</Text>
            <TextInput
              className='border-gray-300 mb-3 rounded border px-3 py-2 text-lg'
              placeholder='€1,100'
              value={bid}
              onChangeText={setBid}
              keyboardType='numeric'
            />
            <TouchableOpacity className='rounded bg-orange-500 py-2'>
              <Text className='text-center font-medium text-white'>
                LIVE BID
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product Details Table */}
          <View className='mb-6'>
            <Text className='mb-3 text-lg font-semibold'>Details</Text>
            {Object.entries(article.details).map(([key, value]) => (
              <View
                key={key}
                className='border-gray-100 flex-row justify-between border-b py-2'
              >
                <Text className='text-gray-600 text-sm'>{key}</Text>
                <Text className='text-gray-900 flex-1 text-right text-sm font-medium'>
                  {String(value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View className='border-gray-200 border-t p-4'>
        <Text className='mb-3 text-lg font-semibold'>Observations</Text>
        <Text className='text-gray-600 mb-4 text-sm'>
          {article.observations}
        </Text>

        <Text className='mb-3 text-lg font-semibold'>Description</Text>
        <Text className='text-gray-700 text-sm leading-6'>
          {article.description}
        </Text>
      </View>
    </ScrollView>
  );
}
