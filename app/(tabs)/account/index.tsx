import Account from './account-user';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { View, ActivityIndicator } from 'react-native';

export default function AccountTab() {
  const { data: currentUser } = useGetCurrentUser();
  const { isNavigating } = useAuthNavigation();

  // Si no hay sesión, mostrar loading mientras ProtectedRoute maneja la redirección
  if (!currentUser) {
    return (
      <View className='flex-1 items-center justify-center'>
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
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  return <Account currentUser={currentUser} />;
}
