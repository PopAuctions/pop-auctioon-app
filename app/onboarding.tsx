import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { triggerHaptic } from '@/utils/triggerHaptic';
import {
  HAS_SEEN_ONBOARDING_KEY,
  VIDEO_LENGTH_MS,
} from '@/constants/onboarding';
import { useOnboardingData } from '@/hooks/pages/onboarding/useOnboardingData';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useCallback, useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/pages/onboarding/useOnboarding';

export default function OnboardingScreen() {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const { navigateWithAuth } = useAuthNavigation();
  const { hasSeenOnboarding } = useOnboarding();
  const [displayFooter, setDisplayFooter] = useState(false);

  const { video, texts, isLoading, error } = useOnboardingData();

  const markAsSeen = async () => {
    await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
  };

  const onSkip = async () => {
    await triggerHaptic('impact');
    await markAsSeen();
    router.replace('/(tabs)/auth/login');
  };

  const onLogin = async () => {
    await triggerHaptic('selection');
    await markAsSeen();
    navigateWithAuth('/(tabs)/auth/login');
  };

  const onRegister = async () => {
    await triggerHaptic('selection');
    await markAsSeen();
    navigateWithAuth('/(tabs)/auth/register-user');
  };

  const handleFooterDisplay = useCallback(async () => {
    hasSeenOnboarding().then((seen) => {
      if (!seen) {
        setTimeout(() => {
          setDisplayFooter(true);
        }, VIDEO_LENGTH_MS);
      }
    });
  }, [hasSeenOnboarding]);

  useEffect(() => {
    if (!isLoading || !video) return;
    handleFooterDisplay();
  }, [handleFooterDisplay, isLoading, video]);

  // Show loading state while fetching slides
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Loading
          locale={locale}
          customMessage={{
            es: 'Cargando tutorial...',
            en: 'Loading tutorial...',
          }}
        />
      </>
    );
  }

  // Show error state if fetch failed
  if (error || !video) {
    const handleGoHome = () => {
      router.replace({
        pathname: '/(tabs)/home',
        params: { skipOnboardingCheck: 'true' },
      });
    };

    const handleRetry = () => {
      router.replace('/onboarding');
    };

    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center bg-white px-8'>
          <CustomText
            type='h3'
            className='mb-4 text-center text-cinnabar'
          >
            {t('commonErrors.generic')}
          </CustomText>
          <CustomText
            type='h3'
            className='mb-2 text-center'
          >
            {t('onboarding.errorLoadingTutorial')}
          </CustomText>
          <CustomText
            type='body'
            className='mb-6 text-center text-base'
          >
            {t('commonErrors.defaultMessage')}
          </CustomText>
          <View className='flex-row gap-4'>
            <Button
              mode='primary'
              onPress={handleRetry}
            >
              {t('globals.refreshPage')}
            </Button>
            <Button
              mode='secondary'
              onPress={handleGoHome}
            >
              {t('globals.goToHome')}
            </Button>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className='flex-1'
        style={{ backgroundColor: video.bgColor }}
      >
        {/* Video - Full screen, no controls */}
        <VideoPlayer uri={video.videoUrl} />

        {/* Skip Button */}
        <View className='absolute right-0 top-0 z-10 px-6 pt-14'>
          <Pressable
            onPress={onSkip}
            hitSlop={10}
            accessibilityRole='button'
            accessibilityLabel={texts.skip[locale]}
            accessibilityHint={t('onboarding.skipHint')}
          >
            <View className='rounded-full bg-white px-4 py-2'>
              <CustomText
                type='bodysmall'
                className='font-semibold text-black'
              >
                {texts.skip[locale]}
              </CustomText>
            </View>
          </Pressable>
        </View>

        {/* Footer: Login + Register */}
        {displayFooter && (
          <View className='absolute bottom-0 left-0 right-0 px-8 pb-12'>
            <View className='flex-row gap-4'>
              <Button
                mode='primary'
                onPress={onLogin}
                className='flex-1'
              >
                {t('loginPage.signIn')}
              </Button>
              <Button
                mode='secondary'
                onPress={onRegister}
                className='flex-1'
              >
                {t('loginPage.register')}
              </Button>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
