import Account from './account-user';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { View, ActivityIndicator } from 'react-native';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';
import { useHideWhileStackBuilds } from '@/hooks/useHideWhileStackBuilds';
import { useGetArticlesByAuctionAmount } from '@/hooks/pages/article/useGetArticlesByAuctionAmount';

export default function AccountTab() {
  const {
    data: currentUser,
    status,
    errorMessage,
    refetch: fetchCurrentUser,
  } = useGetCurrentUser();
  const { data: articlesWonAmount, refetch: refetchArticles } =
    useGetArticlesByAuctionAmount();
  const { isNavigating } = useAuthNavigation();
  const shouldHide = useHideWhileStackBuilds();

  const refetchData = async () => {
    await Promise.all([refetchArticles?.(), fetchCurrentUser?.()]);
  };

  if (shouldHide) {
    return <View className='flex-1 bg-white' />;
  }

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

  return (
    <Account
      currentUser={currentUser}
      numberOfWonArticles={articlesWonAmount}
      refetch={refetchData}
    />
  );
}
