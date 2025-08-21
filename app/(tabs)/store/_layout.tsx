import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function StoreLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.store'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: t('screens.store.productDetail'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
