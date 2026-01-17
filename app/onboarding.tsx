import AsyncStorage from '@react-native-async-storage/async-storage';
import PagerView from 'react-native-pager-view';
import { useRef, useState } from 'react';
import { Image, Pressable, View, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { triggerHaptic } from '@/utils/triggerHaptic';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/onboarding';
import { useOnboardingData } from '@/hooks/pages/onboarding/useOnboardingData';

export default function OnboardingScreen() {
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [index, setIndex] = useState(0);
  const { locale, t } = useTranslation();

  // Fetch onboarding data from API (with fallback to local data)
  const { slides, texts, isLoading } = useOnboardingData();

  const isLast = index === slides.length - 1;

  const finish = async () => {
    await triggerHaptic('success');
    await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/auth');
  };

  const onSkip = async () => {
    await triggerHaptic('impact');
    await finish();
  };

  const onNext = async () => {
    await triggerHaptic('selection');
    if (isLast) {
      await finish();
      return;
    }
    pagerRef.current?.setPage(index + 1);
  };

  // Show loading state while fetching slides
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className='flex-1 items-center justify-center bg-black'>
          <ActivityIndicator
            size='large'
            color='#ffffff'
          />
          <CustomText
            type='body'
            className='mt-4 text-white/80'
          >
            {t('commonActions.loading')}
          </CustomText>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className='flex-1 bg-white'>
        {/* Skip Button */}
        <View className='absolute right-0 top-0 z-10 px-6 pt-14'>
          <Pressable
            onPress={onSkip}
            hitSlop={10}
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

        {/* Slides */}
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setIndex(e.nativeEvent.position)}
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              className='flex-1'
            >
              {/* Image Container - Full screen background */}
              <View className='absolute inset-0'>
                <Image
                  source={slide.image}
                  resizeMode='cover'
                  style={{ width: '100%', height: '100%' }}
                />
                {/* Dark overlay for better text readability */}
                <View className='absolute inset-0 bg-black/40' />
              </View>

              {/* Text Content - Overlay on top */}
              <View className='absolute bottom-32 left-0 right-0 px-8'>
                <CustomText
                  type='h2'
                  className='mb-4 text-white'
                >
                  {slide.title[locale]}
                </CustomText>
                <CustomText
                  type='body'
                  className='text-white/90'
                >
                  {slide.description[locale]}
                </CustomText>
              </View>
            </View>
          ))}
        </PagerView>

        {/* Footer: Dots + Next Button */}
        <View className='absolute bottom-0 left-0 right-0 px-8 pb-12'>
          {/* Dots Indicator */}
          <View className='mb-8 flex-row items-center justify-center'>
            {slides.map((_, i) => (
              <View
                key={i}
                className={`mx-1 h-2 w-2 rounded-full ${
                  i === index ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </View>

          {/* Next/Start Button */}
          <Button
            mode='primary'
            onPress={onNext}
            className='w-full'
          >
            <CustomText
              type='body'
              className='font-semibold text-white'
            >
              {isLast ? texts.start[locale] : texts.next[locale]}
            </CustomText>
          </Button>
        </View>
      </View>
    </>
  );
}
