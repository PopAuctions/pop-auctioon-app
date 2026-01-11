import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import {
  getParentRoute,
  shouldBuildStack,
} from '@/utils/deeplinks/getParentRoute';

export function DeepLinkListener() {
  const { auth } = useAuth();
  const status = auth.state;
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;

      // Skip expo development client links
      if (url.includes('expo-development-client')) return;

      // Parse URL
      const parsedUrl = Linking.parse(url);
      const path = parsedUrl.path || '';

      console.log('🔗 Deep link received:', url);

      // Check if this route needs parent navigation to build stack
      if (shouldBuildStack(path)) {
        const parentRoute = getParentRoute(path);

        if (parentRoute) {
          console.log('🔄 Building navigation stack for nested route');

          // Navigate to parent first to build stack
          router.push(parentRoute as Href);

          // Then navigate to final destination
          setTimeout(() => {
            router.push(path as Href);
          }, 100);

          return;
        }
      }

      // Direct navigation for root tab routes
      router.push(path as Href);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL when app opens from deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [status, router]);

  return null;
}
