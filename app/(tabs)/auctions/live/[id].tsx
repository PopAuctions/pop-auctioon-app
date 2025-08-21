import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentBid, setCurrentBid] = useState(2450);
  const [myBid, setMyBid] = useState('');
  const [timeLeft, setTimeLeft] = useState('44:32');
  const [participants] = useState(23);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nuevas pujas ocasionalmente
      if (Math.random() > 0.8) {
        setCurrentBid((prev) => prev + Math.floor(Math.random() * 100) + 50);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const recentBids = [
    { user: 'Usuario_845', amount: currentBid, time: 'hace 15s' },
    { user: 'Coleccionista_92', amount: currentBid - 75, time: 'hace 1m' },
    { user: 'ArteLover_03', amount: currentBid - 150, time: 'hace 2m' },
    { user: 'BidMaster_77', amount: currentBid - 200, time: 'hace 3m' },
  ];

  const handlePlaceBid = () => {
    const bidAmount = parseInt(myBid);
    if (bidAmount > currentBid) {
      setCurrentBid(bidAmount);
      setMyBid('');
    }
  };

  return (
    <View className='flex-1 bg-gray-900'>
      {/* Live Header */}
      <View className='bg-red-500 p-4'>
        <View className='mb-2 flex-row items-center'>
          <View className='mr-2 h-3 w-3 rounded-full bg-white' />
          <Text className='text-lg font-bold text-white'>
            🔴 SUBASTA EN VIVO
          </Text>
        </View>
        <Text className='text-xl font-bold text-white'>
          Subasta #{id} - Colección Especial
        </Text>
        <View className='mt-2 flex-row justify-between'>
          <Text className='text-white'>⏱️ Tiempo restante: {timeLeft}</Text>
          <Text className='text-white'>👥 {participants} participantes</Text>
        </View>
      </View>

      {/* Current Item & Bid */}
      <View className='border-b border-gray-200 bg-white p-4'>
        <Text className='mb-2 text-2xl font-bold text-gray-800'>
          Pintura Abstracta Contemporánea
        </Text>
        <Text className='mb-2 text-4xl font-bold text-green-600'>
          ${currentBid.toLocaleString()}
        </Text>
        <Text className='text-gray-600'>
          Puja mínima: ${(currentBid + 50).toLocaleString()}
        </Text>
      </View>

      {/* Bidding Section */}
      <View className='border-b border-gray-200 bg-white p-4'>
        <View className='flex-row space-x-3'>
          <TextInput
            className='flex-1 rounded-lg bg-gray-100 px-4 py-3 text-lg text-gray-800'
            placeholder={`Mín. $${(currentBid + 50).toLocaleString()}`}
            value={myBid}
            onChangeText={setMyBid}
            keyboardType='numeric'
          />
          <TouchableOpacity
            className='rounded-lg bg-green-500 px-6 py-3'
            onPress={handlePlaceBid}
          >
            <Text className='text-lg font-bold text-white'>PUJAR</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Bid Buttons */}
        <View className='mt-3 flex-row space-x-2'>
          <TouchableOpacity
            className='flex-1 rounded-lg bg-blue-500 p-2'
            onPress={() => setMyBid((currentBid + 100).toString())}
          >
            <Text className='text-center font-semibold text-white'>+$100</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-1 rounded-lg bg-blue-500 p-2'
            onPress={() => setMyBid((currentBid + 250).toString())}
          >
            <Text className='text-center font-semibold text-white'>+$250</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-1 rounded-lg bg-blue-500 p-2'
            onPress={() => setMyBid((currentBid + 500).toString())}
          >
            <Text className='text-center font-semibold text-white'>+$500</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Bids */}
      <ScrollView className='flex-1 bg-gray-50'>
        <View className='p-4'>
          <Text className='mb-3 text-lg font-bold text-gray-800'>
            💬 Pujas Recientes
          </Text>

          {recentBids.map((bid, index) => (
            <View
              key={index}
              className='mb-2 rounded-lg bg-white p-3 shadow-sm'
            >
              <View className='flex-row items-center justify-between'>
                <View>
                  <Text className='font-semibold text-gray-800'>
                    {bid.user}
                  </Text>
                  <Text className='text-sm text-gray-500'>{bid.time}</Text>
                </View>
                <Text className='text-lg font-bold text-green-600'>
                  ${bid.amount.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
