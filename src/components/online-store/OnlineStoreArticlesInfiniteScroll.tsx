import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomArticleSecondChance, Lang } from '@/types/types';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { OnlineStoreArticleItem } from './OnlineStoreArticleItem';
import { useFetchOnlineStoreArticlesInfinite } from '@/hooks/components/useFetchOnlineStoreArticlesInfinite';
import { Filters } from '@/app/(tabs)/online-store';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { REQUEST_STATUS } from '@/constants';

const ITEMS_PER_PAGE = 4;
const TEXTS = {
  noMoreArticles: {
    en: 'No more articles',
    es: 'No hay más artículos',
  },
  noArticlesFound: {
    en: 'No articles found with the selected filters',
    es: 'No se han encontrado artículos con los filtros seleccionados',
  },
};

export const OnlineStoreArticlesInfiniteScroll = ({
  lang,
  ListHeaderComponent,
  filtersKey,
  texts,
}: {
  lang: Lang;
  ListHeaderComponent: React.ReactElement;
  filtersKey: string;
  texts: { price: string };
}) => {
  const { locale } = useTranslation();
  const params = useLocalSearchParams();
  const { brand, price, model, codeNumber, category, sortBy } =
    params as Filters;

  const { fetchArticles } = useFetchOnlineStoreArticlesInfinite();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();

  const [articles, setArticles] = useState<CustomArticleSecondChance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const syncHasMore = (value: boolean) => {
    hasMoreRef.current = value;
    setHasMore(value);
  };

  const syncOffset = (value: number) => {
    offsetRef.current = value;
  };

  const syncLoading = (value: boolean) => {
    loadingRef.current = value;
    setIsLoading(value);
  };

  const formatter = euroFormatter(lang);
  const filtersActive = Boolean(
    brand || price || model || codeNumber || category || sortBy
  );
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  const loadInitial = useCallback(async () => {
    if (loadingRef.current) return;

    syncLoading(true);
    syncHasMore(true);
    syncOffset(0);

    try {
      const response = await fetchArticles({
        brand,
        price,
        model,
        codeNumber,
        category,
        sortBy,
        offset: 0,
        limit: ITEMS_PER_PAGE,
      });

      const data = response?.data ?? [];

      setArticles(data);
      syncOffset(data.length);
      syncHasMore(data.length === ITEMS_PER_PAGE);
    } catch (e) {
      console.warn('Error loading articles', e);
      syncHasMore(false);
    } finally {
      syncLoading(false);
    }
  }, [fetchArticles, brand, price, model, codeNumber, category, sortBy]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    syncLoading(true);

    try {
      const response = await fetchArticles({
        brand,
        price,
        model,
        codeNumber,
        category,
        sortBy,
        offset: offsetRef.current,
        limit: ITEMS_PER_PAGE,
      });

      const newData = response?.data ?? [];

      if (newData.length === 0) {
        syncHasMore(false);
        return;
      }

      let appendedCount = 0;

      setArticles((prev) => {
        const existing = new Set(prev.map((a) => a.id));
        const unique = newData.filter((a) => !existing.has(a.id));
        appendedCount = unique.length;
        return [...prev, ...unique];
      });

      syncOffset(offsetRef.current + appendedCount);

      if (newData.length < ITEMS_PER_PAGE) syncHasMore(false);
    } catch (e) {
      console.warn('Error loading more', e);
    } finally {
      syncLoading(false);
    }
  }, [fetchArticles, brand, price, model, codeNumber, category, sortBy]);

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const renderFooter = useCallback(() => {
    if (isLoading) return <Loading locale={locale} />;

    if (!hasMore && filtersActive && articles.length === 0) {
      return (
        <View className='items-center justify-center py-4'>
          <CustomText
            type='h4'
            className='text-center text-cinnabar'
          >
            {TEXTS.noArticlesFound[lang]}
          </CustomText>
        </View>
      );
    }

    if (!hasMore) {
      return (
        <View className='items-center justify-center py-4'>
          <CustomText
            type='body'
            className='text-center text-cinnabar'
          >
            {TEXTS.noMoreArticles[lang]}
          </CustomText>
        </View>
      );
    }

    return null;
  }, [isLoading, hasMore, lang, locale, filtersActive, articles.length]);

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id.toString()}
      extraData={{ brand, price, model, codeNumber, category, sortBy }}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
      renderItem={({ item }) => (
        <View style={{ width: '48%' }}>
          <OnlineStoreArticleItem
            onlineStoreArticle={item}
            formatter={formatter}
            texts={texts}
            commissionValue={isCommissionReady ? commissionData : null}
          />
        </View>
      )}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
    />
  );
};
