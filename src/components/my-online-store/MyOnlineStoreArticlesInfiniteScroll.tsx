import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { CustomArticleSecondChance, Lang } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { Loading } from '../ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';
import { REQUEST_STATUS } from '@/constants';
import { useFetchMyOnlineStoreArticlesInfinite } from '@/hooks/components/useFetchMyOnlineStoreArticlesInfinite';
import { Filters } from '@/app/(tabs)/my-online-store';
import { MyOnlineStoreArticleItem } from './MyOnlineStoreArticleItem';

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
  };
}) => {
  const { locale } = useTranslation();
  const params = useLocalSearchParams();
  const { brand, model, codeNumber, offersStatus, status } = params as Filters;

  const { fetchArticles } = useFetchMyOnlineStoreArticlesInfinite();
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const [articles, setArticles] = useState<CustomArticleSecondChance[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const formatter = euroFormatter(lang);
  const filtersActive = Boolean(
    brand || model || codeNumber || offersStatus || status
  );
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchArticles({
        brand,
        model,
        codeNumber,
        status,
        offersStatus,
        offset: 0,
        limit: ITEMS_PER_PAGE,
      });

      const data = response?.data;
      if (!data) {
        setArticles([]);
        setOffset(0);
        setHasMore(false);
        return;
      }

      setArticles(data);
      setOffset(data.length);
      setHasMore(data.length >= ITEMS_PER_PAGE);
    } catch (e) {
      console.warn('Error loading articles', e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchArticles, brand, model, codeNumber, offersStatus, status]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await fetchArticles({
        brand,
        model,
        codeNumber,
        offset,
        status,
        offersStatus,
        limit: ITEMS_PER_PAGE,
      });
      const newData = response.data;

      if (!newData || newData.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique = newData.filter(
          (a: CustomArticleSecondChance) => !existingIds.has(a.id)
        );
        return [...prev, ...unique];
      });
      setOffset((prev) => prev + newData.length);
    } catch (e) {
      console.warn('Error loading more', e);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    hasMore,
    fetchArticles,
    brand,
    model,
    codeNumber,
    offersStatus,
    status,
    offset,
  ]);

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
      extraData={{
        brand,
        model,
        codeNumber,
        offersStatus,
        status,
      }}
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
      onEndReachedThreshold={0.3}
    />
  );
};
