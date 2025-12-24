import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName='index'
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='login'
        options={{
          title: t('screens.account.login'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='register'
        options={{
          title: t('screens.account.register'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='settings'
        options={{
          title: t('screens.account.settings'),
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='info/[page]'
        options={{
          presentation: 'card',
          headerShown: true,
          // El título se establece dinámicamente desde el componente
        }}
      />
    </Stack>
  );
}
