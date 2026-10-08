import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import {
  DEFAULT_LANG,
  LOCALE_CONFIG,
  SUPPORTED_LANGUAGES,
  type Lang,
} from '@/i18n/locales';
import { triggerHaptic } from '@/utils/triggerHaptic';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/onboarding';
import { useOnboardingData } from '@/hooks/pages/onboarding/useOnboardingData';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/pages/onboarding/useOnboarding';

type OnboardingStep = 'language' | 'video';
type OnboardingVideoLang = Lang | 'it';

const ITALIAN_ONBOARDING = {
  chooseLanguage: 'Scegli la tua lingua',
  languageLabel: 'Italiano',
  skip: 'Salta',
  welcome: 'Benvenuto su PopAuctioon!',
  description: 'Scopri aste dal vivo e trova pezzi unici.',
  register: 'Registrati',
  signIn: 'Inizia sessione',
} as const;

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
  const [displayEndMessage, setDisplayEndMessage] = useState(false);

  const languageOptions = [
    ...SUPPORTED_LANGUAGES.map((language) => ({
      value: language as OnboardingVideoLang,
      label: LOCALE_CONFIG[language].label,
      prompt: t('onboarding.chooseLanguage', { locale: language }),
    })),
    {
      value: 'it' as const,
      label: ITALIAN_ONBOARDING.languageLabel,
      prompt: ITALIAN_ONBOARDING.chooseLanguage,
    },
  ];
  const selectedLocale = selectedLang === 'it' ? DEFAULT_LANG : selectedLang;
  const selectedTexts =
    selectedLang === 'it'
      ? ITALIAN_ONBOARDING
      : {
          skip: t('onboarding.skip', {
            locale: selectedLocale ?? locale,
          }),
          welcome: t('onboarding.welcome', {
            locale: selectedLocale ?? locale,
          }),
          description: t('onboarding.description', {
            locale: selectedLocale ?? locale,
          }),
          register: t('loginPage.register', {
            locale: selectedLocale ?? locale,
          }),
          signIn: t('loginPage.signIn', {
            locale: selectedLocale ?? locale,
          }),
        };

  const selectedVideoUrl = selectedLang
    ? videosData?.videos[selectedLang]
    : null;

  const handleSelectLanguage = async (lang: OnboardingVideoLang) => {
    await triggerHaptic('selection');

    changeLanguage(lang === 'it' ? DEFAULT_LANG : lang);
    setSelectedLang(lang);
    setDisplayEndMessage(false);
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
      // timeout one second
      setTimeout(() => {
        if (!seen) {
          setDisplayEndMessage(true);
        } else {
          navigateWithAuth('/(tabs)/account');
        }
      }, 250);
    });
  };

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      if (seen) {
        setSelectedLang(locale);
        setDisplayEndMessage(false);
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
          customMessage={t('onboarding.loading')}
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
          {languageOptions.map(({ value, prompt }, index) => (
            <CustomText
              key={value}
              type={index === 0 ? 'h3' : 'body'}
              className='mb-1 text-center'
            >
              {prompt}
            </CustomText>
          ))}
          <View className='mt-4 w-full gap-2'>
            {languageOptions.map(({ value, label }) => (
              <Button
                key={value}
                mode='secondary'
                onPress={() => handleSelectLanguage(value)}
              >
                {label}
              </Button>
            ))}
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
        className='relative flex-1'
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
            accessibilityLabel={selectedTexts.skip}
            accessibilityHint={t('onboarding.skipHint')}
          >
            <View className='rounded-full bg-cinnabar px-4 py-2'>
              <CustomText
                type='bodysmall'
                className='font-semibold text-white'
              >
                {selectedTexts.skip}
              </CustomText>
            </View>
          </Pressable>
        </View>

        {displayEndMessage && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            className='absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-white px-6 pb-10 pt-8 shadow-lg'
          >
            {/* Welcome message */}
            <CustomText
              type='h1'
              className='mb-2 text-center'
            >
              {selectedTexts.welcome}
            </CustomText>

            <CustomText
              type='body'
              className='text-gray-500 mb-6 text-center'
            >
              {selectedTexts.description}
            </CustomText>

            {/* Actions */}
            <View className='flex-row gap-3'>
              <Button
                mode='secondary'
                className='flex-1'
                onPress={onRegister}
              >
                {selectedTexts.register}
              </Button>

              <Button
                mode='primary'
                className='flex-1'
                onPress={onLogin}
              >
                {selectedTexts.signIn}
              </Button>
            </View>
          </Animated.View>
        )}
      </View>
    </>
  );
}
