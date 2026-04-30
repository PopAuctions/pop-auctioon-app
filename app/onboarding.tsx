import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { triggerHaptic } from '@/utils/triggerHaptic';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/onboarding';
import { useOnboardingData } from '@/hooks/pages/onboarding/useOnboardingData';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/pages/onboarding/useOnboarding';
import { Lang } from '@/types/types';

type OnboardingStep = 'language' | 'video';
type OnboardingVideoLang = Lang | 'it';

const texts = {
  skip: { es: 'Omitir', en: 'Skip' },
  next: { es: 'Siguiente', en: 'Next' },
  start: { es: 'Empezar', en: 'Get Started' },
};

export default function OnboardingScreen() {
  const { locale, t, changeLanguage } = useTranslation();
  const { navigateWithAuth } = useAuthNavigation();
  const { hasSeenOnboarding } = useOnboarding();
  const { videosData, isLoading, error } = useOnboardingData();
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('language');
  const [selectedLang, setSelectedLang] = useState<OnboardingVideoLang | null>(
    null
  );
  const [displayFooter, setDisplayFooter] = useState(false);

  const selectedVideoUrl = selectedLang
    ? videosData?.videos[selectedLang]
    : null;

  const handleSelectLanguage = async (lang: OnboardingVideoLang) => {
    await triggerHaptic('selection');

    changeLanguage(lang === 'it' ? 'es' : lang);
    setSelectedLang(lang);
    setDisplayFooter(false);
    setStep('video');
  };

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

  const onVideoEnd = async () => {
    hasSeenOnboarding().then((seen) => {
      if (!seen) {
        setDisplayFooter(true);
      }
    });
  };

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      if (seen) {
        setSelectedLang(locale);
        setDisplayFooter(false);
        setStep('video');
      }
    });
  }, [hasSeenOnboarding, router, locale]);

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

  if (error || !videosData) {
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

  if (step === 'language') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <View className='flex-1 items-center justify-center bg-white px-8'>
          <CustomText
            type='h3'
            className='mb-1 text-center'
          >
            Elige tu idioma
          </CustomText>
          <CustomText
            type='body'
            className='mb-1 text-center'
          >
            Choose your language
          </CustomText>
          <CustomText
            type='body'
            className='mb-1 text-center'
          >
            Scegli la tua lingua
          </CustomText>
          <View className='mt-4 w-full gap-2'>
            <Button
              mode='secondary'
              onPress={() => handleSelectLanguage('es')}
            >
              Español
            </Button>
            <Button
              mode='secondary'
              onPress={() => handleSelectLanguage('en')}
            >
              English
            </Button>
            <Button
              mode='secondary'
              onPress={() => handleSelectLanguage('it')}
            >
              Italiano
            </Button>
          </View>
        </View>
      </>
    );
  }

  if (!selectedVideoUrl) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className='flex-1'
        style={{ backgroundColor: videosData?.bgColor }}
      >
        <VideoPlayer
          uri={selectedVideoUrl}
          onEnd={onVideoEnd}
        />

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
