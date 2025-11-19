import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { ArticleItem } from './ArticleItem';
import { euroFormatter } from '@/utils/euroFormatter';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { useFetchAuctionArticlesInfinite } from '@/hooks/components/useFetchAuctionArticlesInifinte';
import { Loading } from '../ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';

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

export const ArticlesInfiniteScroll = ({
  lang,
  auctionId,
  articlesFollowed,
  ListHeaderComponent,
  order,
  texts,
  filtersKey,
}: {
  lang: Lang;
  auctionId: string | number;
  ListHeaderComponent: React.ReactElement;
  articlesFollowed: number[];
  order?: number[];
  texts: { currentBid: string };
  filtersKey: string;
}) => {
  const { locale } = useTranslation();
  const { brand, price } = useLocalSearchParams<{
    brand?: string;
    price?: string;
  }>();

  const { fetchArticles } = useFetchAuctionArticlesInfinite();
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [effectiveOrder, setEffectiveOrder] = useState<number[] | undefined>(
    order
  );

  const formatter = euroFormatter(lang);
  const filtersActive = Boolean(brand || price);

  const orderedArticles = useMemo(() => {
    if (!effectiveOrder || effectiveOrder.length === 0) return articles;

    const map = new Map(articles.map((a) => [a.id.toString(), a]));

    return effectiveOrder
      .map((id) => map.get(id.toString()))
      .filter((a): a is SimpleArticle => !!a);
  }, [articles, effectiveOrder]);

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchArticles({
        auctionId,
        brand,
        price,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });

      const data = response?.data;
      if (!data) {
        setArticles([]);
        setOffset(0);
        setHasMore(false);
        setEffectiveOrder(filtersActive ? undefined : order);
        return;
      }

      setArticles(data);
      setOffset(data.length);
      setHasMore(data.length >= ITEMS_PER_PAGE);
      setEffectiveOrder(filtersActive ? undefined : order);
    } catch (e) {
      console.warn('Error loading articles', e);
      setHasMore(false);
      setEffectiveOrder(filtersActive ? undefined : order);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, brand, price, order, fetchArticles, filtersActive]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await fetchArticles({
        auctionId,
        brand,
        price,
        offset,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });
      const newData = response.data;

      if (!newData || newData.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique = newData.filter(
          (a: SimpleArticle) => !existingIds.has(a.id)
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
    auctionId,
    brand,
    price,
    offset,
    isLoading,
    hasMore,
    order,
    fetchArticles,
  ]);

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, auctionId, order]);

  const renderFooter = useCallback(() => {
    if (isLoading && hasMore) return <Loading locale={locale} />;

    if (!hasMore && filtersActive && articles.length === 0) {
      return (
        <View className='items-center justify-center py-4'>
          <CustomText
            type='body'
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
      data={orderedArticles}
      keyExtractor={(item) => item.id.toString()}
      extraData={{
        brand,
        price,
        order: effectiveOrder,
        articlesFollowed,
        texts,
      }}
      renderItem={({ item }) => (
        <ArticleItem
          article={item}
          auctionLang={{ currentBid: texts.currentBid }}
          formatter={formatter}
          lang={lang}
          userFollows={articlesFollowed.includes(Number(item.id))}
          commissionValue={LOW_COMMISSION_AMOUNT}
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
