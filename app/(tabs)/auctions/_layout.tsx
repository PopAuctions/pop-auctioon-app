import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuctionsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Configuración global para pantalla principal
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.auctions'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='calendar'
        options={{
          title: 'Calendario de Subastas',
          presentation: 'card',
          headerShown: true, // Solo mostrar en pantallas secundarias
        }}
      />
      <Stack.Screen
        name='articles'
        options={{
          title: 'All Articles',
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: t('screens.auctions.detail'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='article/[id]'
        options={{
          title: 'Article Detail',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='live/[id]'
        options={{
          title: 'Subasta en Vivo',
          presentation: 'fullScreenModal',
          headerShown: true,
          headerStyle: { backgroundColor: '#dc2626' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
