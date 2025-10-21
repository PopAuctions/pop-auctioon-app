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
    <ScrollView className='flex-1'>
      <View className='p-4'>
        <Text className='text-gray-800 mb-6 text-2xl font-bold'>
          Editar Subasta #{id}
        </Text>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Título</Text>
          <TextInput
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Descripción</Text>
          <TextInput
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
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
            className='bg-gray-100 text-gray-800 rounded-lg px-4 py-3'
            value={startingPrice}
            onChangeText={setStartingPrice}
            keyboardType='numeric'
            editable={false}
          />
          <Text className='text-gray-500 mt-1 text-sm'>
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
          className='bg-gray-300 items-center rounded-lg p-4'
          onPress={() => router.back()}
        >
          <Text className='text-gray-700 text-lg font-semibold'>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
