import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { router } from 'expo-router';
import { useState } from 'react';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers = [
    { name: 'Google', icon: 'google', color: '#DB4437' },
    { name: 'Apple', icon: 'apple', color: '#000000' },
  ];

  const handleProviderPress = (providerName: string) => {
    setSelectedProvider(providerName);
    // TODO: Implement auth with providers in the future
    console.log(`Selected provider: ${providerName}`);
  };

  const handleRegisterAsUser = () => {
    router.push('/(tabs)/auth/register-user');
  };

  const handleRegisterAsAuctioneer = () => {
    router.push('/(tabs)/auth/register-auctioneer');
  };

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
      >
        {/* Título */}
        <View className='mb-8'>
          <CustomText
            type='h1'
            className='mb-2 text-center text-cinnabar'
          >
            {t('screens.account.registerOptions')}
          </CustomText>
          <CustomText
            type='body'
            className='text-gray-600 text-center'
          >
            {t('screens.account.orRegisterWith')}
          </CustomText>
        </View>

        {/* Providers (Google, Facebook, Apple) */}
        <View className='mb-6 gap-3'>
          {providers.map((provider) => (
            <Pressable
              key={provider.name}
              onPress={() => handleProviderPress(provider.name)}
              className='border-gray-300 flex-row items-center justify-center gap-3 rounded-lg border bg-white px-4 py-3'
            >
              <FontAwesomeIcon
                name={provider.icon as any}
                variant='bold'
                size={20}
                color={provider.color as `#${string}`}
              />
              <CustomText
                type='body'
                className='text-gray-800'
              >
                {t('screens.account.continueWith')} {provider.name}
              </CustomText>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View className='my-6 flex-row items-center'>
          <View className='bg-gray-300 h-px flex-1' />
          <CustomText
            type='body'
            className='text-gray-500 mx-3'
          >
            {t('commonActions.or')}
          </CustomText>
          <View className='bg-gray-300 h-px flex-1' />
        </View>

        {/* Botón: Registrarse como Usuario */}
        <View className='mb-4'>
          <Button
            onPress={handleRegisterAsUser}
            mode='primary'
            className='w-full'
          >
            <CustomText
              type='body'
              className='text-white'
            >
              {t('screens.account.registerAsUser')}
            </CustomText>
          </Button>
        </View>

        <Divider />

        {/* Link: ¿Deseas unirte como auctioneer? */}
        <View className='my-6'>
          <Pressable onPress={handleRegisterAsAuctioneer}>
            <CustomText
              type='body'
              className='text-center text-cinnabar underline'
            >
              {t('screens.account.registerAsAuctioneer')}
            </CustomText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
