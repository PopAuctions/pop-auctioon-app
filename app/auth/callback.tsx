import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase/supabase-store';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';

const SUCCESS_REDIRECT_URL = '/(tabs)/home';
const FAILURE_REDIRECT_URL = '/(tabs)/auth/login';

export default function AuthCallbackScreen() {
  const { locale } = useTranslation();
  const { code, error } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  const router = useRouter();
  const { callToast } = useToast(locale);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        if (error || !code) {
          callToast({
            variant: 'error',
            description: {
              en: 'Authentication failed. Please try again.',
              es: 'La autenticación ha fallado. Por favor, inténtelo de nuevo.',
            },
          });
          router.replace(FAILURE_REDIRECT_URL);

          return;
        }

        // Start listening BEFORE exchange (so we don't miss the event)
        const { data: sub } = supabase.auth.onAuthStateChange(
          (event, session) => {
            // console.log('Auth event:', event, !!session);

            if (!alive) return;

            if (event === 'SIGNED_IN' && session) {
              callToast({
                variant: 'success',
                description: {
                  en: 'Successfully authenticated!',
                  es: '¡Autenticación exitosa!',
                },
              });
              router.replace(SUCCESS_REDIRECT_URL);
            }
          }
        );

        const { error: exErr } =
          await supabase.auth.exchangeCodeForSession(code);
        // console.log('exchangeCodeForSession finished:', exErr);

        if (exErr) {
          sub.subscription.unsubscribe();
          callToast({
            variant: 'error',
            description: {
              en: 'Authentication failed. Please try again.',
              es: 'La autenticación ha fallado. Por favor, inténtelo de nuevo.',
            },
          });

          router.replace(FAILURE_REDIRECT_URL);
          return;
        }

        // If for some reason SIGNED_IN didn’t fire, fallback:
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          callToast({
            variant: 'success',
            description: {
              en: 'Successfully authenticated!',
              es: '¡Autenticación exitosa!',
            },
          });
          router.replace(SUCCESS_REDIRECT_URL);
        } else {
          callToast({
            variant: 'error',
            description: {
              en: 'Authentication failed. Please try again.',
              es: 'La autenticación ha fallado. Por favor, inténtelo de nuevo.',
            },
          });

          router.replace(FAILURE_REDIRECT_URL);
        }

        sub.subscription.unsubscribe();
      } catch {
        // console.log('callback error:', e);
        callToast({
          variant: 'error',
          description: {
            en: 'Authentication failed. Please try again.',
            es: 'La autenticación ha fallado. Por favor, inténtelo de nuevo.',
          },
        });
        router.replace(FAILURE_REDIRECT_URL);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [code, error, router, callToast]);

  return <Loading locale={locale} />;
}
