import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomArticleSecondChance, Lang, LangMap } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { Loading } from '../ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { REQUEST_STATUS } from '@/constants';
import { useFetchMyOnlineStoreArticlesInfinite } from '@/hooks/components/useFetchMyOnlineStoreArticlesInfinite';
import { Filters } from '@/app/(tabs)/auctioneer/my-online-store';
import { MyOnlineStoreArticleItem } from './MyOnlineStoreArticleItem';
import { CustomError } from '../ui/CustomError';

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

export const MyOnlineStoreArticlesInfiniteScroll = ({
  lang,
  ListHeaderComponent,
  filtersKey,
  texts,
}: {
  lang: Lang;
  ListHeaderComponent: React.ReactElement;
  filtersKey: string;
  texts: {
    price: string;
    offersText: string;
    checkDetails: string;
    viewInStore: string;
  };
}) => {
  const { locale } = useTranslation();
  const params = useLocalSearchParams();
  const { brand, model, codeNumber, offersStatus, status } = params as Filters;

  const { fetchArticles } = useFetchMyOnlineStoreArticlesInfinite();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();

  const [articles, setArticles] = useState<CustomArticleSecondChance[]>([]);
  const [error, setError] = useState<LangMap | null>(null);
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
    brand || model || codeNumber || offersStatus || status
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
        model,
        codeNumber,
        status,
        offersStatus,
        offset: 0,
        limit: ITEMS_PER_PAGE,
      });

      if (response.error) {
        setError(response.error);
        setArticles([]);
        syncHasMore(false);
        return;
      }

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
  }, [fetchArticles, brand, model, codeNumber, offersStatus, status]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    syncLoading(true);

    try {
      const response = await fetchArticles({
        brand,
        model,
        codeNumber,
        status,
        offersStatus,
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
  }, [fetchArticles, brand, model, codeNumber, offersStatus, status]);

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

  if (error) {
    return (
      <CustomError
        customMessage={error}
        refreshRoute='/(tabs)/auctioneer/my-online-store'
      />
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id.toString()}
      extraData={{ brand, model, codeNumber, offersStatus, status }}
      renderItem={({ item }) => (
        <MyOnlineStoreArticleItem
          onlineStoreArticle={item}
          formatter={formatter}
          texts={texts}
          lang={lang}
          commissionValue={isCommissionReady ? commissionData : null}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        rowGap: 20,
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
    />
  );
};
