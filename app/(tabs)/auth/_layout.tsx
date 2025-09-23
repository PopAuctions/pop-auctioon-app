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
          title: t('tabsNames.login'),
          headerShown: false,
        }}
      />
      {/* Pantallas futuras para autenticación - COMENTADAS HASTA IMPLEMENTAR
      <Stack.Screen
        name='register'
        options={{
          title: 'Registrarse',
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='forgot-password'
        options={{
          title: 'Recuperar Contraseña',
          presentation: 'card',
          headerShown: true,
        }}
      />
      */}
    </Stack>
  );
}