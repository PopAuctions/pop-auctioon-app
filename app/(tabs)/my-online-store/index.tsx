import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';

export default function MyOnlineStoreScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-6 py-6'
      >
        <View className='flex-1 items-center justify-center'>
          <CustomText
            type='h1'
            className='mb-4 text-center'
          >
            {t('screens.myOnlineStore.title')}
          </CustomText>
          <CustomText
            type='body'
            className='text-center text-gray-600'
          >
            {t('screens.myOnlineStore.welcome')}
          </CustomText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
