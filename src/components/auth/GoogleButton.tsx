import { useRef } from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import { useRouter } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { ProviderButton } from './ProviderButton';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export const GoogleButton = ({
  buttonText,
  isDisabled,
}: {
  buttonText: string;
  isDisabled?: boolean;
}) => {
  const oauthInFlightRef = useRef(false);
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const router = useRouter();

  const handleGooglePress = async () => {
    if (oauthInFlightRef.current) return;
    oauthInFlightRef.current = true;

    try {
      await WebBrowser.dismissBrowser();

      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
    } catch {
      callToast({
        variant: 'error',
        description: {
          en: 'An unexpected error occurred during Google sign-in. Please try again.',
          es: 'Ocurrió un error inesperado durante el inicio de sesión con Google. Por favor, inténtelo de nuevo.',
        },
      });
    } finally {
      oauthInFlightRef.current = false;
    }
  };

  return (
    <ProviderButton
      buttonText={`${buttonText} Google`}
      icon='google'
      iconColor='#4285F4'
      onPress={handleGooglePress}
      variant='light'
      isDisabled={isDisabled}
    />
  );
};
