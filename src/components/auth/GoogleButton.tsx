import { Pressable } from 'react-native';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import { supabase } from '@/utils/supabase/supabase-store';
import { useRouter } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export const GoogleButton = ({ buttonText }: { buttonText: string }) => {
  const { locale } = useTranslation();
  const router = useRouter();
  const { callToast } = useToast(locale);

  const handleGooglePress = async () => {
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

    if (typeof code !== 'string') throw new Error('No code found');

    router.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
  };

  return (
    <Pressable
      onPress={handleGooglePress}
      className='border-gray-300 flex-row items-center justify-center gap-3 rounded-lg border bg-white px-4 py-3'
    >
      <FontAwesomeIcon
        name='google'
        variant='bold'
        size={20}
        color='#4285F4'
      />
      <CustomText
        type='body'
        className='text-gray-800'
      >
        {buttonText} Google
      </CustomText>
    </Pressable>
  );
};
