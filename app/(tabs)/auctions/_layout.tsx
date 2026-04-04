import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { SmartBack } from '@/components/ui/SmartBack';

const INDEX_ROUTE = '/(tabs)/auctions';

export default function AuctionsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: true, // Configuración global para pantalla principal
        headerTitleAlign: 'center',
        headerBackTitle: t('tabsNames.back'),
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
          title: t('tabsNames.auctions'),
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      {/* <Stack.Screen
        name='articles'
        options={{
          title: t('screens.auctions.allArticles'),
          presentation: 'card',
          headerShown: true,
          headerBackTitle: t('tabsNames.back'),
        }}
      /> */}
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
          presentation: 'card',
          headerShown: false,
          headerStyle: { backgroundColor: '#dc2626' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
