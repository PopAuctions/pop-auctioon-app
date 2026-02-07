import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { SmartBack } from '@/components/ui/SmartBack';

const INDEX_ROUTE = '/(tabs)/my-auctions';

export default function HomeLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: true, // Configuración global para evitar headers
        headerTitleAlign: 'center',
        headerLeft: () => {
          return (
            <SmartBack
              fallbackHref={INDEX_ROUTE}
              label={t('tabsNames.back')}
            />
          );
        },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.home'),
          headerShown: false,
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
