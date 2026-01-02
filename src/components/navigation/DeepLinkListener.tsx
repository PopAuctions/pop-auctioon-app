import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/auth-context';

export function DeepLinkListener() {
  const { auth } = useAuth();
  const status = auth.state;

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;

      if (url.includes('expo-development-client')) return;
      if (url.includes('/auth/callback')) return;
      if (status === 'loading') return;

      console.log('🔗 Deep link received:', url);

      const isAccountRoute = url.includes('/account');
      const isAuthRoute = url.includes('/auth/');

      if (isAccountRoute && status !== 'authenticated') {
        console.log('🔒 Deep link to protected account route without auth');
      } else if (isAuthRoute && status === 'authenticated') {
        console.log('✅ Deep link to auth route with active session');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [status]);

  return null;
}
