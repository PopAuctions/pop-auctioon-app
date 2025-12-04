import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useAuth } from '@/context/auth-context';
import { CustomLink } from '@/components/ui/CustomLink';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { getSession } = useAuth();
  const [session] = getSession();

  return (
    <SafeAreaView
      className='flex-1  '
      edges={['top']}
    >
      <ScrollView className='flex-1'>
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
              className='rounded-lg bg-blue-500 p-4'
            >
              <Text className='text-center text-lg font-semibold text-white'>
                🧪 API Testing Lab
              </Text>
              <Text className='mt-1 text-center text-blue-100'>
                Probar conectividad y endpoints
              </Text>
            </CustomLink>
          </View>

          {/* Botón para Testing Chat */}
          <View className='mb-6'>
            <CustomLink
              href='/home/test-chat'
              mode='empty'
              className='rounded-lg bg-cinnabar p-4'
            >
              <Text className='text-center text-lg font-semibold text-white'>
                💬 Test Chat en Vivo
              </Text>
              <Text className='mt-1 text-center text-red-100'>
                Probar AWS IVS Chat
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
                <Text>→ Ir a Subastas (pública)</Text>
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

          {/* 🧪 SECCIÓN DE TESTING - Rutas Protegidas */}
          <View className='mt-6 rounded-lg border-2 border-orange-300 bg-orange-50 p-4'>
            <Text className='mb-2 text-lg font-bold text-orange-800'>
              🧪 TEST: Rutas Protegidas con [id] Dinámico
            </Text>
            <Text className='mb-4 text-sm text-orange-700'>
              Estos botones prueban la protección de rutas con parámetros
              dinámicos.
              {'\n'}Prueba con usuario AUCTIONEER y USER para ver las
              diferencias.
            </Text>

            {/* Test 1: Ruta simple protegida (AUCTIONEER) */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 1: Ruta simple (requiere AUCTIONEER)
              </Text>
              <CustomLink
                href='/(tabs)/my-auctions'
                mode='secondary'
                size='small'
              >
                Ir a My Auctions
              </CustomLink>
            </View>

            {/* Test 2: Ruta dinámica protegida (AUCTIONEER) */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 2: Ruta dinámica my-auctions/[id] (requiere AUCTIONEER)
              </Text>
              <CustomLink
                href='/(tabs)/my-auctions/28'
                mode='secondary'
                size='small'
              >
                Ir a My Auction #28
              </CustomLink>
            </View>

            {/* Test 3: Otra ruta dinámica (AUCTIONEER) */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 3: Crear nueva subasta (requiere AUCTIONEER)
              </Text>
              <CustomLink
                href='/(tabs)/my-auctions/new'
                mode='secondary'
                size='small'
              >
                Crear Nueva Subasta
              </CustomLink>
            </View>

            {/* Test 4: Ruta protegida cualquier usuario */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 4: Ruta protegida (cualquier usuario autenticado)
              </Text>
              <CustomLink
                href='/(tabs)/account/edit-profile'
                mode='secondary'
                size='small'
              >
                Editar Perfil
              </CustomLink>
            </View>

            {/* Test 5: Live auction con ID dinámico */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 5: Subasta en vivo auctions/live/[id] (requiere auth)
              </Text>
              <CustomLink
                href='/(tabs)/auctions/live/123'
                mode='secondary'
                size='small'
              >
                Unirse a Live Auction #123
              </CustomLink>
            </View>

            {/* Test 6: Ruta pública */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 6: Ruta pública (sin protección)
              </Text>
              <CustomLink
                href='/(tabs)/auctions'
                mode='primary'
                size='small'
              >
                Ver Todas las Subastas
              </CustomLink>
            </View>

            {/* Test 7: Ruta multi-nivel con múltiples IDs dinámicos */}
            <View className='mb-3'>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 7: Multi-nivel my-auctions/[id]/edit-article/[slug]
                (AUCTIONEER)
              </Text>
              <CustomLink
                href='/(tabs)/my-auctions/28/edit-article/72'
                mode='secondary'
                size='small'
              >
                Editar Artículo #72 en Mi Subasta #28
              </CustomLink>
            </View>

            {/* Test 8: Otra ruta multi-nivel */}
            <View>
              <Text className='text-gray-600 mb-1 text-xs font-medium'>
                Test 8: my-auctions/[id]/rearrange-article-images/[slug]
                (AUCTIONEER)
              </Text>
              <CustomLink
                href='/(tabs)/my-auctions/28/rearrange-article-images/72'
                mode='secondary'
                size='small'
              >
                Reorganizar Imágenes Artículo #72
              </CustomLink>
            </View>

            {/* Leyenda de resultados esperados */}
            <View className='mt-4 rounded border border-orange-300 bg-white p-3'>
              <Text className='text-gray-700 mb-2 text-xs font-bold'>
                📋 Resultados Esperados:
              </Text>
              <Text className='text-gray-600 text-xs'>
                ✅ AUCTIONEER: Puede acceder a todos los tests (1-8){'\n'}
                ⚠️ USER: Solo puede acceder a Tests 4, 5 y 6{'\n'}❌ Sin sesión:
                Redirige a /auth en Tests 1-3, 5, 7-8
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
