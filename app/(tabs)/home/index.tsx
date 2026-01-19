import React, { useState, useEffect } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { UpcomingAuctionsSection } from '@/components/home/UpcomingAuctions';
import { useFetchUpcomingAuctions } from '@/hooks/pages/auction/useFetchUpcomingAuctions';
import { REQUEST_STATUS } from '@/constants';
import { useFetchMostViewedArticles } from '@/hooks/pages/article/useFetchMostViewedArticles';
import { useFetchFeaturedArticles } from '@/hooks/pages/article/useFetchFeaturedArticles';
import { useFetchNewestArticles } from '@/hooks/pages/article/useFetchNewestArticles';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { ArticlesSection } from '@/components/home/ArticlesSection';
import { useOnboarding } from '@/hooks/pages/onboarding/useOnboarding';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { hasSeenOnboarding } = useOnboarding();
  const { t, locale } = useTranslation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // All hooks must be called before any conditional returns
  const { data: upcomingAuctions, status: upcomingAuctionsStatus } =
    useFetchUpcomingAuctions();
  const { data: mostViewedArticles, status: mostViewedArticlesStatus } =
    useFetchMostViewedArticles();
  const { data: featuredArticles, status: featuredArticlesStatus } =
    useFetchFeaturedArticles();
  const { data: newestArticles, status: newestArticlesStatus } =
    useFetchNewestArticles();
  const { data: commission, status: commissionsStatus } = useFetchCommissions();

  useEffect(() => {
    const checkAndShowOnboarding = async () => {
      // Skip check if coming from onboarding error
      if (params.skipOnboardingCheck === 'true') {
        setCheckingOnboarding(false);
        return;
      }

      const seen = await hasSeenOnboarding();
      if (!seen) {
        // Navigate to onboarding
        router.replace('/onboarding');
      }
      setCheckingOnboarding(false);
    };

    checkAndShowOnboarding();
  }, [hasSeenOnboarding, router, params.skipOnboardingCheck]);

  // Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          size='large'
          color='#e63946'
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      className='flex-1'
      edges={['top']}
    >
      <ScrollView className='flex-1 px-4'>
        <UpcomingAuctionsSection
          auctions={upcomingAuctions}
          locale={locale}
          isLoading={upcomingAuctionsStatus === REQUEST_STATUS.loading}
          texts={{
            title: t('screens.homePage.upcomingAuctionsTitle'),
            noAuction: t('screens.homePage.noAuctions'),
          }}
        />

        <ArticlesSection
          lang={locale}
          commissionValue={
            commissionsStatus === REQUEST_STATUS.success ? commission : null
          }
          texts={{
            featuredArticlesText: t('screens.homePage.featuredArticles'),
            newestArticlesText: t('screens.homePage.newestArticles'),
            mostViewedArticlesText: t('screens.homePage.mostViewedArticles'),
            currentBid: t('screens.homePage.currentBid'),
          }}
          articles={{
            newestArticles:
              newestArticlesStatus === REQUEST_STATUS.success
                ? newestArticles
                : [],
            featuredArticles:
              featuredArticlesStatus === REQUEST_STATUS.success
                ? featuredArticles
                : [],
            mostViewedArticles:
              mostViewedArticlesStatus === REQUEST_STATUS.success
                ? mostViewedArticles
                : [],
          }}
          articlesReady={{
            newestArticlesReady:
              newestArticlesStatus === REQUEST_STATUS.success,
            featuredArticlesReady:
              featuredArticlesStatus === REQUEST_STATUS.success,
            mostViewedArticlesReady:
              mostViewedArticlesStatus === REQUEST_STATUS.success,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
