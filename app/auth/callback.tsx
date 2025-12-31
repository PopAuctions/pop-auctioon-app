import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase/supabase-store';

export default function AuthCallbackScreen() {
  const { code, error, error_description } = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const router = useRouter();
  console.log('Auth callback params:', { code, error, error_description });

  useEffect(() => {
    const run = async () => {
      if (error) {
        router.replace('/(tabs)/auth/login');
        return;
      }

      if (!code) {
        router.replace('/(tabs)/auth/login');
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        router.replace('/(tabs)/auth/login');
        return;
      }

      router.replace('/(tabs)');
    };

    run().catch(() => router.replace('/(tabs)/auth/login'));
  }, [code, error, router]);

  return null;
}
