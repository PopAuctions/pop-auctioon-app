import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { MyOnlineStoreArticleFilters } from '@/components/my-online-store/MyOnlineStoreArticleFilters';
import { MyOnlineStoreArticlesInfiniteScroll } from '@/components/my-online-store/MyOnlineStoreArticlesInfiniteScroll';

export interface Filters {
  brand?: string;
  model?: string;
  codeNumber?: string;
  status?: string;
  offersStatus?: string;
}

export default function MyOnlineStoreScreen() {
  const { t, locale } = useTranslation();
  const params = useLocalSearchParams();
  const { brand, model, codeNumber, status, offersStatus } = params as Filters;
  const filtersKey = `${brand ?? ''}${model ?? ''}${codeNumber ?? ''}${status ?? ''}${offersStatus ?? ''}`;

  const renderAuctionHeader = useCallback(() => {
    return (
      <View className='mb-4 mt-2 flex w-full flex-col'>
        <MyOnlineStoreArticleFilters
          locale={locale}
          texts={{ newArticle: t('screens.myOnlineStore.createArticle') }}
        />
      </View>
    );
  }, [locale, t]);

  return (
    <View className='flex-1'>
      <MyOnlineStoreArticlesInfiniteScroll
        lang={locale}
        ListHeaderComponent={renderAuctionHeader()}
        filtersKey={filtersKey}
        texts={{
          price: t('screens.store.price'),
          offersText: t('screens.myOnlineStore.offers'),
          checkDetails: t('screens.myOnlineStore.viewDetails'),
          viewInStore: t('screens.myOnlineStore.viewInStore'),
        }}
      />
    </View>
  );
}
