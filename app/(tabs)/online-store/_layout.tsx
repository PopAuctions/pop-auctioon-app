import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function StoreLayout() {
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
          title: t('screens.store.title'),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='articles/[id]'
        options={{
          title: t('screens.store.productDetail'),
          presentation: 'card',
          headerShown: true, // Solo en detalle de producto
        }}
      />
    </Stack>
  );
}
