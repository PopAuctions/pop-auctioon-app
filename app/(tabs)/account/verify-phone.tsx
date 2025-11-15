import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { VerifyPhoneWizard } from '@/components/verify-phone/VerifyPhoneWizard';
import { Loading } from '@/components/ui/Loading';

export default function VerifyPhoneScreen() {
  const { locale } = useTranslation();
  const { data: currentUser, status } = useGetCurrentUser();

  // Loading state
  if (status === 'loading' || status === 'idle') {
    return <Loading locale={locale} />;
  }

  // Error or no user - shouldn't happen if ProtectedRoute works correctly
  if (status === 'error' || !currentUser) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <View className='flex-1 items-center justify-center p-6'>
          {/* Error content could go here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        contentContainerClassName='flex-grow py-6'
        keyboardShouldPersistTaps='handled'
      >
        <VerifyPhoneWizard
          verifiedPhoneNumber={currentUser.phoneNumber ?? ''}
          isPhoneVerified={currentUser.phoneValidated ?? false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
