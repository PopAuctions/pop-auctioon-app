import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/auth-context';

export function DeepLinkListener() {
  const { session, status } = useAuth();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;

      if (url.includes('expo-development-client')) return;

      console.log('🔗 Deep link received:', url);

      if (
        url.includes('/account') &&
        (!session || status !== 'authenticated')
      ) {
        console.log(
          '🔒 Deep link a cuenta sin auth, ProtectedRoute redirigirá a login'
        );
      } else if (
        url.includes('/auth') &&
        session &&
        status === 'authenticated'
      ) {
        console.log(
          '✅ Deep link a auth con sesión, ProtectedRoute redirigirá a home'
        );
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [session, status]);

  return null;
}
