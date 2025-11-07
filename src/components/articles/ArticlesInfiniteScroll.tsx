import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { ArticleItem } from './AuctionArticleItem';
import { euroFormatter } from '@/utils/euroFormatter';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { useFetchAuctionArticlesInfinite } from '@/hooks/components/useFetchAuctionArticlesInifinte';
import { Loading } from '../ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';

const ITEMS_PER_PAGE = 1;
const TEXTS = {
  noMoreArticles: {
    en: 'No more articles',
    es: 'No hay más artículos',
  },
};

export const ArticlesInfiniteScroll = ({
  lang,
  auctionId,
  articlesFollowed,
  ListHeaderComponent,
  order,
}: {
  lang: Lang;
  auctionId: string | number;
  ListHeaderComponent: React.ReactElement;
  articlesFollowed: number[];
  order?: number[];
}) => {
  const { locale } = useTranslation();
  const { fetchArticles } = useFetchAuctionArticlesInfinite();
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const formatter = euroFormatter(lang);

  const orderedArticles = useMemo(() => {
    if (!order || order.length === 0) return articles;

    const articleMap = new Map(articles.map((a) => [a.id.toString(), a]));

    return order
      .map((id) => articleMap.get(id.toString()))
      .filter((a): a is SimpleArticle => !!a);
  }, [articles, order]);

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchArticles({
        auctionId,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });
      const data = response?.data;

      if (!data) {
        setHasMore(false);
        return;
      }

      setArticles(data);
      setOffset(data.length);
      if (data.length < ITEMS_PER_PAGE) setHasMore(false);
    } catch (error) {
      console.warn('Error loading articles', error);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, order, fetchArticles]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await fetchArticles({
        auctionId,
        offset,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });
      const newData = response.data;

      if (!newData) {
        setHasMore(false);
        return;
      }

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueArticles = newData.filter(
            (article: SimpleArticle) => !existingIds.has(article.id)
          );

          return [...prev, ...uniqueArticles];
        });
        setOffset((prev) => prev + newData.length);
      }
    } catch (error) {
      console.warn('Error loading more', error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading, hasMore, auctionId, order, fetchArticles]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const renderFooter = useCallback(() => {
    if (isLoading && hasMore) {
      return <Loading locale={locale} />;
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
  }, [isLoading, hasMore, lang, locale]);

  return (
    <FlatList
      data={orderedArticles}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ArticleItem
          article={item}
          // WIP: pass correct texts
          auctionLang={{
            currentBid: 'Current Bid',
            follow: 'Follow',
            unfollow: 'Unfollow',
          }}
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
