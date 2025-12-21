import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

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
          title: t('screens.auctions.calendar'),
          presentation: 'card',
          headerShown: true, // Solo mostrar en pantallas secundarias
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='articles'
        options={{
          title: t('screens.auctions.allArticles'),
          presentation: 'card',
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: t('screens.auctions.detail'),
          presentation: 'card',
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='articles/[id]'
        options={{
          title: t('tabsNames.articleDetails'),
          presentation: 'card',
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      />
      <Stack.Screen
        name='live/[id]'
        options={{
          title: t('screens.auctions.liveAuction'),
          presentation: 'fullScreenModal',
          headerShown: false,
          headerStyle: { backgroundColor: '#dc2626' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
