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
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='new'
        options={{
          title: t('screens.myAuctions.newAuction'),
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='old'
        options={{
          title: t('screens.myAuctions.oldAuctions'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: t('screens.auctions.detail'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/edit'
        options={{
          title: t('screens.myAuctions.edit') + ' subasta',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/new-article'
        options={{
          title: t('screens.myAuctions.edit') + ' nuevo artículo',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='[id]/edit-article/[slug]'
        options={{
          title: t('screens.myAuctions.edit') + ' artículo',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
