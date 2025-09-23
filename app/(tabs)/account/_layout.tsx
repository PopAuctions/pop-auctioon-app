import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function AccountLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.account'),
          headerShown: false,
        }}
      />
      {/* Pantallas futuras para navegación desde ACCOUNT - COMENTADAS HASTA IMPLEMENTAR
      <Stack.Screen
        name='profile'
        options={{
          title: 'Mi Perfil',
          presentation: 'card',
          headerShown: true, // Solo en pantallas secundarias
        }}
      />
      <Stack.Screen
        name='settings'
        options={{
          title: 'Configuración',
          presentation: 'card',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='help'
        options={{
          title: 'Ayuda',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='privacy'
        options={{
          title: 'Privacidad',
          presentation: 'card',
        }}
      />
      */}
    </Stack>
  );
}
