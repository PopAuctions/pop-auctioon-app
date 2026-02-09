import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { FlatList, View } from 'react-native';
import { ArticleItem } from './ArticleItem';
import { euroFormatter } from '@/utils/euroFormatter';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { useFetchAuctionArticlesInfinite } from '@/hooks/components/useFetchAuctionArticlesInifinte';
import { Loading } from '../ui/Loading';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
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
  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();

  const { fetchArticles } = useFetchAuctionArticlesInfinite();
  const [articles, setArticles] = useState<SimpleArticle[]>([]);
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
  const filtersActive = Boolean(brand || price);
  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;
  const effectiveOrder = filtersActive ? undefined : order;

  const orderedArticles = useMemo(() => {
    if (!effectiveOrder || effectiveOrder.length === 0) return articles;

    const map = new Map(
      articles.map((article) => [article.id.toString(), article])
    );

    return effectiveOrder
      .map((id) => map.get(id.toString()))
      .filter((article): article is SimpleArticle => !!article);
  }, [articles, effectiveOrder]);

  const loadInitial = useCallback(async () => {
    if (loadingRef.current) return;
    syncLoading(true);
    syncHasMore(true);
    syncOffset(0);

    try {
      const response = await fetchArticles({
        auctionId,
        brand,
        price,
        offset: 0,
        limit: ITEMS_PER_PAGE,
        orderedIds: filtersActive ? undefined : order,
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
  }, [auctionId, brand, price, order, fetchArticles, filtersActive]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    syncLoading(true);

    try {
      const response = await fetchArticles({
        auctionId,
        brand,
        price,
        offset: offsetRef.current,
        limit: ITEMS_PER_PAGE,
        orderedIds: filtersActive ? undefined : order,
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

      // if server returns < limit
      if (newData.length < ITEMS_PER_PAGE) syncHasMore(false);
    } catch (e) {
      console.warn('Error loading more', e);
    } finally {
      syncLoading(false);
    }
  }, [auctionId, brand, price, order, fetchArticles, filtersActive]);
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
      onMomentumScrollBegin={() => {}}
    />
  );
};
