import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Datos simulados del producto basado en el collar chanel
const getProductData = (id: string) => {
  const products: any = {
    '871': {
      title: 'collar chanel',
      brand: 'Chanel',
      price: 990,
      description:
        'Elegante collar de la prestigiosa marca Chanel. Pieza única de colección en excelente estado.',
      images: 4,
      condition: 'Excelente',
      authenticity: 'Verificado',
      serviceCode: '15.5% (VAT included) apart',
    },
  };
  return products[id] || products['871'];
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [offer, setOffer] = useState('');

  const product = getProductData(id || '871');

  return (
    <ScrollView className='flex-1  '>
      {/* Product Images Carousel */}
      <View className='relative'>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className='h-80'
        >
          {Array.from({ length: product.images }).map((_, index) => (
            <View
              key={index}
              className='bg-gray-200 items-center justify-center'
              style={{ width }}
            >
              <Text className='text-gray-500 text-4xl'>📷</Text>
              <Text className='text-gray-400 mt-2'>Imagen {index + 1}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Image Navigation Arrows */}
        <TouchableOpacity
          className='absolute left-4 top-1/2 rounded-full  p-2'
          onPress={() =>
            setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
          }
        >
          <Text>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='absolute right-4 top-1/2 rounded-full  p-2'
          onPress={() =>
            setCurrentImageIndex(
              Math.min(product.images - 1, currentImageIndex + 1)
            )
          }
        >
          <Text>→</Text>
        </TouchableOpacity>
      </View>

      <View className='p-4'>
        {/* Breadcrumb */}
        <Text className='mb-4 text-sm text-red-500'>{product.brand}</Text>

        {/* Product Title */}
        <Text className='text-gray-900 mb-6 text-3xl font-light'>
          {product.title}
        </Text>

        <View className='flex-row'>
          {/* Left Column - Product Info */}
          <View className='flex-1 pr-4'>
            {/* Price */}
            <View className='mb-6'>
              <Text className='mb-2 text-lg font-semibold'>Price</Text>
              <Text className='text-4xl font-light'>€{product.price}</Text>
              <Text className='text-gray-500 text-sm'>
                {product.serviceCode}
              </Text>
            </View>

            {/* Product Details */}
            <View className='mb-6'>
              <Text className='mb-3 text-lg font-semibold'>
                Detalles del Producto
              </Text>
              <View className='space-y-2'>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-600'>Estado:</Text>
                  <Text className='font-medium'>{product.condition}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-600'>Autenticidad:</Text>
                  <Text className='font-medium text-green-600'>
                    {product.authenticity}
                  </Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-600'>Marca:</Text>
                  <Text className='font-medium'>{product.brand}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View className='mb-6'>
              <Text className='mb-3 text-lg font-semibold'>Descripción</Text>
              <Text className='text-gray-700 leading-6'>
                {product.description}
              </Text>
            </View>
          </View>

          {/* Right Column - Make Offer */}
          <View className=' w-80 rounded-lg p-4'>
            <Text className='mb-4 text-xl font-semibold'>
              Make an offer to the seller!
            </Text>

            {/* Offer Input */}
            <View className='mb-4'>
              <TextInput
                className='border-gray-300 rounded-lg border px-4 py-3 text-lg'
                placeholder='€'
                value={offer}
                onChangeText={setOffer}
                keyboardType='numeric'
              />
              <Text className='text-gray-500 mt-1 text-sm'>
                The minimum offer is: €693
              </Text>
            </View>

            {/* Make Offer Button */}
            <TouchableOpacity className='mb-4 rounded-lg bg-red-500 p-3'>
              <Text className='text-center text-lg font-semibold text-white'>
                MAKE AN OFFER
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className='text-gray-500 text-xs leading-4'>
              If your offer is accepted, you will receive an email with the next
              steps and have 24 hours to make the payment.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
