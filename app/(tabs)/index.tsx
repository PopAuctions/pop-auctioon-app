import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

/**
 * Index route that redirects based on authentication status
 * Onboarding is now handled within the home screen
 */
export default function TabsIndex() {
  const { auth } = useAuth();

  // Wait for auth to finish loading or validating before deciding where to redirect.
  if (auth.state === 'loading' || auth.state === 'pending') {
    return null;
  }

  if (auth.state === 'unauthenticated') {
    return <Redirect href='/(tabs)/auth' />;
  }

  return <Redirect href='/(tabs)/home' />;
}
