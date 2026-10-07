import { useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase/supabase-store';
import { useRouter } from 'expo-router';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { ProviderButton } from './ProviderButton';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { MessageKey } from '@/i18n';

const APPLE_SIGN_IN_START_ERROR =
  'auth.oauth.apple.startFailed' as const satisfies MessageKey;
const APPLE_SIGN_IN_CANCELLED_ERROR =
  'auth.oauth.apple.cancelledOrFailed' as const satisfies MessageKey;
const APPLE_SIGN_IN_CODE_ERROR =
  'auth.oauth.apple.codeMissing' as const satisfies MessageKey;
const APPLE_SIGN_IN_UNEXPECTED_ERROR =
  'auth.oauth.apple.unexpected' as const satisfies MessageKey;

export const AppleButton = ({
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

  const isIOS = Platform.OS === 'ios';

  const handleApplePress = async () => {
    if (oauthInFlightRef.current) return;
    oauthInFlightRef.current = true;

    try {
      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo },
      });

      if (error) {
        callToast({
          variant: 'error',
          description: APPLE_SIGN_IN_START_ERROR,
        });
        return;
      }
      if (!data.url) {
        callToast({
          variant: 'error',
          description: APPLE_SIGN_IN_START_ERROR,
        });
        return;
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type !== 'success') {
        callToast({
          variant: 'error',
          description: APPLE_SIGN_IN_CANCELLED_ERROR,
        });
        return;
      }

      const parsed = Linking.parse(res.url);
      const code = parsed.queryParams?.code;

      if (typeof code !== 'string') {
        callToast({
          variant: 'error',
          description: APPLE_SIGN_IN_CODE_ERROR,
        });
        return;
      }

      router.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
    } catch {
      callToast({
        variant: 'error',
        description: APPLE_SIGN_IN_UNEXPECTED_ERROR,
      });
    } finally {
      oauthInFlightRef.current = false;
    }
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
