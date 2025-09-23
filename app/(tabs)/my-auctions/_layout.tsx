import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function MyAuctionsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Configuración global
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.myAuctions'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='create'
        options={{
          title: t('screens.myAuctions.createAuction'),
          presentation: 'modal',
          headerShown: true, // Solo en pantallas secundarias
        }}
      />
      <Stack.Screen
        name='[id]/index'
        options={{
          title: t('screens.myAuctions.detail'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/edit'
        options={{
          title: t('screens.myAuctions.edit'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='[id]/stats'
        options={{
          title: t('screens.myAuctions.stats'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
