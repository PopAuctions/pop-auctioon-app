import Account from './account-user';
import { useAuth } from '@/context/auth-context';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { View, ActivityIndicator } from 'react-native';

export default function AccountTab() {
  const { session } = useAuth();
  const { isNavigating } = useAuthNavigation();

  // Si no hay sesión, mostrar loading mientras ProtectedRoute maneja la redirección
  if (!session) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  // Mostrar loading si está navegando
  if (isNavigating) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  return <Account session={session} />;
}
