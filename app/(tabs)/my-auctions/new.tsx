import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
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

    Alert.alert('Éxito', 'Subasta creada exitosamente', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-6 text-2xl font-bold'>
          {t('screens.myAuctions.edit')}
        </Text>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Título</Text>
          <TextInput
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
            placeholder='Nombre de tu subasta'
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Descripción</Text>
          <TextInput
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
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
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
            placeholder='0.00'
            value={startingPrice}
            onChangeText={setStartingPrice}
            keyboardType='numeric'
          />
        </View>

        <View className='mb-6'>
          <Text className='mb-2 text-lg font-semibold'>Duración (horas)</Text>
          <TextInput
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
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
          className='bg-gray-300 items-center rounded-lg p-4'
          onPress={() => router.back()}
        >
          <Text className='text-gray-700 text-lg font-semibold'>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
