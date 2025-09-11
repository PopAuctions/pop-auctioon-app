import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

/**
 * Index route that redirects based on authentication status
 * Redirects authenticated users to home, unauthenticated to auth
 */
export default function TabsIndex() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href='/(tabs)/auth' />;
  }

  return <Redirect href='/(tabs)/home' />;
}
