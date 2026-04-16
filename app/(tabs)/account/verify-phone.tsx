import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetCurrentUser } from '@/hooks/pages/user/useGetCurrentUser';
import { VerifyPhoneWizard } from '@/components/verify-phone/VerifyPhoneWizard';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';

export default function VerifyPhoneScreen() {
  const { locale } = useTranslation();
  const router = useRouter();
  const { data: currentUser, status } = useGetCurrentUser();

  // Redirect to account if no user (like web version)
  useEffect(() => {
    if (
      status === REQUEST_STATUS.error ||
      (!currentUser && status === REQUEST_STATUS.success)
    ) {
      router.replace('/(tabs)/account');
    }
  }, [status, currentUser, router]);

  // Loading state
  if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
    return <Loading locale={locale} />;
  }

  // If redirecting, show loading while navigating
  if (status === REQUEST_STATUS.error || !currentUser) {
    return <Loading locale={locale} />;
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
