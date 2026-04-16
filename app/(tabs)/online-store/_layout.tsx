import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { SmartBack } from '@/components/ui/SmartBack';

const INDEX_ROUTE = '/(tabs)/online-store';

export default function StoreLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: true, // Configuración global
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
          title: t('screens.store.title'),
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name='articles/[id]'
        options={{
          title: t('screens.store.productDetail'),
          presentation: 'card',
          headerShown: true, // Solo en detalle de producto
          headerBackTitle: t('tabsNames.back'),
        }}
      />
    </Stack>
  );
}
