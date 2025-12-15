import Account from './account-user';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { View, ActivityIndicator } from 'react-native';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';

export default function AccountTab() {
  const { data: currentUser, status, errorMessage } = useGetCurrentUser();
  const { isNavigating } = useAuthNavigation();

  // Si no hay sesión, mostrar loading mientras ProtectedRoute maneja la redirección
  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          size='large'
          color='#d75639'
        />
      </View>
    );
  }

  if (status === REQUEST_STATUS.error || !currentUser) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account'
      />
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
