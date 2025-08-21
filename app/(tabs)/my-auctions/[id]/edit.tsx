import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function EditAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('Producto de Ejemplo');
  const [description, setDescription] = useState('Descripción del producto...');
  const [startingPrice, setStartingPrice] = useState('100.00');

  const handleSaveChanges = () => {
    console.log('Saving changes for auction:', id);
    Alert.alert('Éxito', 'Cambios guardados exitosamente', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className='flex-1 bg-white'>
      <View className='p-4'>
        <Text className='mb-6 text-2xl font-bold text-gray-800'>
          Editar Subasta #{id}
        </Text>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Título</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Descripción</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
        </View>

        <View className='mb-6'>
          <Text className='mb-2 text-lg font-semibold'>Precio Inicial ($)</Text>
          <TextInput
            className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
            value={startingPrice}
            onChangeText={setStartingPrice}
            keyboardType='numeric'
            editable={false}
          />
          <Text className='mt-1 text-sm text-gray-500'>
            El precio inicial no se puede modificar una vez iniciada la subasta
          </Text>
        </View>

        <TouchableOpacity
          className='mb-3 items-center rounded-lg bg-blue-500 p-4'
          onPress={handleSaveChanges}
        >
          <Text className='text-lg font-semibold text-white'>
            Guardar Cambios
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
