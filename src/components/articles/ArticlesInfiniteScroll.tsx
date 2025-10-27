import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { ArticleItem } from './AuctionArticleItem';
import { euroFormatter } from '@/utils/euroFormatter';
import { fetchAuctionArticles } from '@/lib/api/fetch-auction-articles';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';

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
  ListHeaderComponent,
  order,
}: {
  lang: Lang;
  auctionId: string | number;
  ListHeaderComponent: React.ReactElement;
  order?: number[];
}) => {
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
      const data = await fetchAuctionArticles({
        auctionId,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });
      setArticles(data);
      setOffset(data.length);
      if (data.length < ITEMS_PER_PAGE) setHasMore(false);
    } catch (error) {
      console.warn('Error loading articles', error);
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, order]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const newData = await fetchAuctionArticles({
        auctionId,
        offset,
        limit: ITEMS_PER_PAGE,
        orderedIds: order,
      });
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
  }, [offset, isLoading, hasMore, auctionId, order]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const renderFooter = useCallback(() => {
    if (isLoading && hasMore) {
      return (
        <View className='items-center justify-center py-4'>
          <ActivityIndicator />
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
  }, [isLoading, hasMore, lang]);

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
          // WIP: pass correct user follow status
          userFollows={false}
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
