import { Stack, router } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useAuth } from '@/context/auth-context';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountLayout() {
  const { t } = useTranslation();
  const { getSession } = useAuth();
  const [session] = getSession();

  // Handler para el botón back de rutas públicas
  const handlePublicRouteBack = () => {
    if (session) {
      // Usuario loggeado → Regresar a account
      router.replace('/(tabs)/account');
    } else {
      // Usuario NO loggeado → Regresar a login
      router.replace('/(tabs)/auth');
    }
  };

  // Componente de botón back que siempre se muestra
  const BackButton = () => (
    <TouchableOpacity
      onPress={handlePublicRouteBack}
      className='pl-4 pr-6'
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
        size={24}
        color='#000'
      />
    </TouchableOpacity>
  );

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
        name='about-us'
        options={{
          title: t('screens.account.aboutUs'),
          presentation: 'card',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name='how-it-works'
        options={{
          title: t('screens.account.howItWorks'),
          presentation: 'card',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name='faqs'
        options={{
          title: t('screens.account.faqs'),
          presentation: 'card',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name='contact-us'
        options={{
          title: t('screens.account.contactUs'),
          presentation: 'card',
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
