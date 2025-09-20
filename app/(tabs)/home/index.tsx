import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/auth-context';
import { CustomLink } from '@/components/ui/CustomLink';

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  return (
    <ScrollView
      className='flex-1 bg-white'
      style={{ paddingTop: insets.top }}
    >
      <View className='flex-1 p-6'>
        {/* Header de Bienvenida */}
        <View className='mb-8'>
          <Text className='text-gray-800 mb-2 text-3xl font-bold'>
            {t('screens.home.title')}
          </Text>
          <Text className='text-gray-600 text-lg'>
            {t('screens.home.subtitle')}
          </Text>
          {session && (
            <Text className='text-gray-500 mt-4'>
              Bienvenido, {session.user?.email}
            </Text>
          )}
        </View>

        {/* Botón para Testing API */}
        <View className='mb-6'>
          <CustomLink
            href='/home/api-testing'
            mode='empty'
            className='rounded-lg bg-blue-500 p-4 shadow-lg'
          >
            <Text className='text-center text-lg font-semibold text-white'>
              🧪 API Testing Lab
            </Text>
            <Text className='mt-1 text-center text-blue-100'>
              Probar conectividad y endpoints
            </Text>
          </CustomLink>
        </View>

        {/* Información de la App */}
        <View className='bg-gray-100 rounded-lg p-6'>
          <Text className='text-gray-800 mb-3 text-lg font-semibold'>
            ¿Qué puedes hacer aquí?
          </Text>
          <View className='space-y-2'>
            <Text className='text-gray-600'>
              • 🏠 Explorar subastas en vivo
            </Text>
            <Text className='text-gray-600'>• 🛍️ Comprar en la tienda</Text>
            <Text className='text-gray-600'>
              • 📅 Ver calendario de eventos
            </Text>
            <Text className='text-gray-600'>• 👤 Gestionar tu cuenta</Text>
            {session && (
              <Text className='text-gray-600'>
                • 🔨 Crear tus propias subastas
              </Text>
            )}
          </View>

          {/* Enlaces de ejemplo para probar CustomLink */}
          <View className='mt-4 space-y-2'>
            <Text className='text-gray-700 text-sm font-medium'>
              Enlaces de prueba (CustomLink automático):
            </Text>
            <CustomLink
              href='/(tabs)/auctions'
              mode='plainText'
            >
              <Text>→ Ir a Subastas (requiere auth)</Text>
            </CustomLink>
            <CustomLink
              href='/(tabs)/my-auctions'
              mode='plainText'
            >
              <Text>→ Mis Subastas (requiere AUCTIONEER)</Text>
            </CustomLink>
          </View>
        </View>

        {/* Footer con estado de autenticación */}
        <View className='mt-8 rounded-lg bg-blue-50 p-4'>
          <Text className='font-semibold text-blue-800'>
            Estado: {session ? '🟢 Conectado' : '🔴 No autenticado'}
          </Text>
          {session && (
            <Text className='mt-1 text-blue-600'>
              Sesión activa desde Supabase
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
