import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type { SimpleArticle, Lang } from '@/types/types';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { ArticleItem } from '@/components/articles/ArticleItem';

const ITEMS_GAP = 32;

export const ArticlesSlider = ({
  articles,
  lang,
  formatter,
  texts,
  commissionValue,
}: {
  articles: SimpleArticle[];
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number | null;
  texts: { currentBid: string };
}) => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<SimpleArticle>>(null);
  const [page, setPage] = useState(0);

  const CARD_W = Math.min(width - 48, Math.round(width * 0.95));

  const scrollToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(articles.length - 1, index));
    const offset = clamped * (CARD_W + ITEMS_GAP);
    listRef.current?.scrollToOffset({ offset, animated: true });
    setPage(clamped);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / (CARD_W + ITEMS_GAP));
    setPage(next);
  };

  return (
    <View className='w-full px-2'>
      <FlatList<SimpleArticle>
        ref={listRef}
        data={articles}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + ITEMS_GAP}
        snapToAlignment='start'
        decelerationRate='fast'
        ItemSeparatorComponent={() => <View style={{ width: ITEMS_GAP }} />}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W }}>
            <ArticleItem
              article={item}
              auctionLang={{ currentBid: texts.currentBid }}
              formatter={formatter}
              lang={lang}
              commissionValue={commissionValue}
              showFollowButton={false}
            />
          </View>
        )}
      />

      {/* Arrows + dots */}
      <View className='mt-3 flex-row items-center justify-between px-4'>
        <Pressable
          onPress={() => {
            scrollToPage(page - 1);
          }}
          disabled={page <= 0}
          className='h-10 w-10 items-center justify-center rounded-full disabled:opacity-50'
          accessibilityLabel='Previous article'
          accessibilityHint='Navigates to the previous article in the slider'
        >
          <FontAwesomeIcon
            variant='bold'
            name='arrow-circle-left'
            size={28}
            color='cinnabar'
          />
        </Pressable>

        <View
          className='flex-row items-center'
          style={{ gap: 8 }}
        >
          {articles.map((article, idx) => (
            <View
              key={article.id}
              className={
                idx === page
                  ? 'h-2 w-2 rounded-full bg-cinnabar'
                  : 'h-2 w-2 rounded-full bg-neutral-600'
              }
              accessibilityRole='progressbar'
              accessibilityLabel={`Page ${page + 1} of ${articles.length}`}
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            scrollToPage(page + 1);
          }}
          disabled={page >= articles.length - 1}
          className='h-10 w-10 items-center justify-center rounded-full disabled:opacity-50'
          accessibilityHint='Next article'
          accessibilityLabel='Navigates to the next article in the slider'
        >
          <FontAwesomeIcon
            variant='bold'
            name='arrow-circle-right'
            size={28}
            color='cinnabar'
          />
        </Pressable>
      </View>
    </View>
  );
};
