import Account from './account-user';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function AccountTab() {
  const { session } = useAuth();

  useEffect(() => {
    // Si no hay sesión, redirigir a la pantalla de auth
    if (!session) {
      router.replace('/(tabs)/auth');
    }
  }, [session]);

  // Si no hay sesión, mostrar loading o null mientras redirige
  if (!session) {
    return null;
  }

  return <Account session={session} />;
}
