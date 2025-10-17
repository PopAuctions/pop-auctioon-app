import { Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function AccountLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t('tabsNames.account'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='account-user'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='edit-profile'
        options={{
          title: t('screens.account.editProfile'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='reset-password'
        options={{
          title: t('screens.account.resetPassword'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='verify-phone'
        options={{
          title: t('screens.account.verifyPhone'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='addresses'
        options={{
          title: t('screens.account.addresses'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='billing-info'
        options={{
          title: t('screens.account.billingInfo'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='payments-history'
        options={{
          title: t('screens.account.paymentsHistory'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name='info/[page]'
        options={{
          presentation: 'card',
          // El título se establece dinámicamente desde el componente
        }}
      />
    </Stack>
  );
}
