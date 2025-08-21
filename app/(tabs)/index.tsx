import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View className='flex-1 items-center justify-center bg-white px-4'>
      <Text className='mb-2 text-center text-3xl font-bold text-gray-800'>
        {t('screens.home.title')}
      </Text>
      <Text className='text-center text-gray-600'>
        {t('screens.home.subtitle')}
      </Text>
    </View>
  );
}
