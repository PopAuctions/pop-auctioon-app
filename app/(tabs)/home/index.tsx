import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='flex-1 bg-white'
      style={{ paddingTop: insets.top }}
    >
      <View className='flex-1 items-center justify-center px-4'>
        <Text className='text-gray-800 mb-2 text-center text-3xl font-bold'>
          {t('screens.home.title')}
        </Text>
        <Text className='text-gray-600 text-center'>
          {t('screens.home.subtitle')}
        </Text>
      </View>
    </View>
  );
}
