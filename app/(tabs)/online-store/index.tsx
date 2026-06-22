import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { OnlineStoreArticlesInfiniteScroll } from '@/components/online-store/OnlineStoreArticlesInfiniteScroll';
import { OnlineStoreArticleFilters } from '@/components/online-store/OnlineStoreArticleFilters';
import { useCallback } from 'react';
import { useHideWhileStackBuilds } from '@/hooks/useHideWhileStackBuilds';

export interface Filters {
  brand?: string;
  price?: string;
  model?: string;
  material?: string;
  color?: string;
  sortBy?: string;
}

export default function OnlineStoreScreen() {
  const { t, locale } = useTranslation();
  const params = useLocalSearchParams();
  const { brand, price, model, material, color, sortBy } = params as Filters;
  const filtersKey = `${brand ?? ''}${price ?? ''}${model ?? ''}${material ?? ''}${color ?? ''}${sortBy || ''}`;

  const shouldHide = useHideWhileStackBuilds();

  const renderAuctionHeader = useCallback(() => {
    return (
      <View className='mb-4 mt-2 flex w-full flex-col'>
        <OnlineStoreArticleFilters locale={locale} />
      </View>
    );
  }, [locale]);

  if (shouldHide) {
    return <View className='flex-1 bg-white' />;
  }

  return (
    <View className='flex-1'>
      <OnlineStoreArticlesInfiniteScroll
        lang={locale}
        ListHeaderComponent={renderAuctionHeader()}
        filtersKey={filtersKey}
        texts={{
          price: t('screens.store.price'),
        }}
      />
    </View>
  );
}
