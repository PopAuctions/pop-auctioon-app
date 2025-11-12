import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { OnlineStoreArticlesInfiniteScroll } from '@/components/online-store/OnlineStoreArticlesInfiniteScroll';
import { OnlineStoreArticleFilters } from '@/components/online-store/OnlineStoreArticleFilters';
export default function OnlineStoreScreen() {
  const { t, locale } = useTranslation();
  const { brand, price } = useLocalSearchParams<{
    brand?: string;
    price?: string;
  }>();
  const filtersKey = `${brand ?? ''}${price ?? ''}`;

  function renderAuctionHeader() {
    return (
      <View className='my-4 flex w-full flex-col'>
        <OnlineStoreArticleFilters locale={locale} />
      </View>
    );
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
