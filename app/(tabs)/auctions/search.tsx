import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

const sampleResults = [
  { id: '1', title: 'Pintura Vintage', currentBid: 450, timeLeft: '2h 15m' },
  { id: '2', title: 'Reloj Antíguo', currentBid: 1200, timeLeft: '4h 30m' },
  { id: '3', title: 'Collar de Perlas', currentBid: 800, timeLeft: '1h 45m' },
];

export default function AuctionSearchScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(sampleResults);

  const handleSearch = () => {
    // Lógica de búsqueda aquí
    console.log('Searching for:', searchQuery);
  };

  const renderResult = ({ item }: { item: (typeof sampleResults)[0] }) => (
    <TouchableOpacity className='mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <Text className='mb-1 text-lg font-semibold text-gray-800'>
        {item.title}
      </Text>
      <Text className='font-medium text-blue-600'>
        Puja actual: ${item.currentBid}
      </Text>
      <Text className='text-gray-500'>Tiempo restante: {item.timeLeft}</Text>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-gray-50'>
      <View className='border-b border-gray-200 bg-white p-4'>
        <TextInput
          className='rounded-lg bg-gray-100 px-4 py-3 text-gray-800'
          placeholder='Buscar subastas...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          className='mt-3 items-center rounded-lg bg-blue-500 p-3'
          onPress={handleSearch}
        >
          <Text className='font-semibold text-white'>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
