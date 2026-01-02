import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase/supabase-store';
import { useRouter } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ProviderButton } from './ProviderButton';

export const AppleButton = ({
  buttonText,
  isDisabled,
}: {
  buttonText: string;
  isDisabled?: boolean;
}) => {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const router = useRouter();

  const isIOS = Platform.OS === 'ios';

  const handleApplePress = async () => {
    const redirectTo = Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo },
    });

    if (error) {
      callToast({
        variant: 'error',
        description: {
          en: 'Failed to initiate Google sign-in. Please try again.',
          es: 'No se pudo iniciar el inicio de sesión con Google. Por favor, inténtelo de nuevo.',
        },
      });
      return;
    }
    if (!data.url) {
      callToast({
        variant: 'error',
        description: {
          en: 'Failed to initiate Google sign-in. Please try again.',
          es: 'No se pudo iniciar el inicio de sesión con Google. Por favor, inténtelo de nuevo.',
        },
      });
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (res.type !== 'success') {
      callToast({
        variant: 'error',
        description: {
          en: 'Google sign-in was cancelled or failed. Please try again.',
          es: 'El inicio de sesión con Google fue cancelado o fallido. Por favor, inténtelo de nuevo.',
        },
      });
      return;
    }

    const parsed = Linking.parse(res.url);
    const code = parsed.queryParams?.code;

    if (typeof code !== 'string') {
      callToast({
        variant: 'error',
        description: {
          en: 'Failed to retrieve authentication code from Google. Please try again.',
          es: 'No se pudo obtener el código de autenticación de Google. Por favor, inténtelo de nuevo.',
        },
      });
      return;
    }

    router.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
  };

  return (
    <ProviderButton
      buttonText={`${buttonText} Apple`}
      icon='apple'
      iconColor={isIOS ? '#FFFFFF' : '#000000'}
      onPress={handleApplePress}
      variant={isIOS ? 'dark' : 'light'}
      isDisabled={isDisabled}
    />
  );
};
