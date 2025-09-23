import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function HomeLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: false, // Configuración global para evitar headers
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.home'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='api-testing'
        options={{
          title: '🧪 API Testing Lab',
          presentation: 'card',
          headerShown: true, // Solo mostrar header en pantallas secundarias
        }}
      />
      {/* Pantallas futuras para navegación desde HOME - COMENTADAS HASTA IMPLEMENTAR
      <Stack.Screen
        name='quick-access'
        options={{
          title: 'Acceso Rápido',
          presentation: 'card',
          headerShown: true, // Solo mostrar header en pantallas secundarias
        }}
      />
      <Stack.Screen
        name='featured-auctions'
        options={{
          title: 'Subastas Destacadas',
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='featured-products'
        options={{
          title: 'Productos Destacados',
          presentation: 'card',
        }}
      />
      */}
    </Stack>
  );
}
