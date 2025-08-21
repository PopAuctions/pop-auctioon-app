import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';

export default function CreateAuctionScreen() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [duration, setDuration] = useState('');

  const handleCreateAuction = () => {
    if (!title || !description || !startingPrice || !duration) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Lógica para crear la subasta
    console.log('Creating auction:', {
      title,
      description,
      startingPrice,
      duration,
    });
    Alert.alert('Éxito', 'Subasta creada exitosamente', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        <Text className='mb-6 text-2xl font-bold text-gray-800'>
          {t('screens.myAuctions.createAuction')}
        </Text>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Título</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            placeholder='Nombre de tu subasta'
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Descripción</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            placeholder='Describe tu producto...'
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Precio Inicial ($)</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            placeholder='0.00'
            value={startingPrice}
            onChangeText={setStartingPrice}
            keyboardType='numeric'
          />
        </View>

        <View className='mb-6'>
          <Text className='mb-2 text-lg font-semibold'>Duración (horas)</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            placeholder='24'
            value={duration}
            onChangeText={setDuration}
            keyboardType='numeric'
          />
        </View>

        <TouchableOpacity
          className='mb-3 items-center rounded-lg bg-blue-500 p-4'
          onPress={handleCreateAuction}
        >
          <Text className='text-lg font-semibold text-white'>
            Crear Subasta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='items-center rounded-lg bg-gray-300 p-4'
          onPress={() => router.back()}
        >
          <Text className='text-lg font-semibold text-gray-700'>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
