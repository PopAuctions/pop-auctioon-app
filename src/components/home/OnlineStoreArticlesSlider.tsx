import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  Pressable,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type { CustomArticleSecondChance, Lang } from '@/types/types';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { OnlineStoreArticleItem } from '../online-store/OnlineStoreArticleItem';

const ITEMS_GAP = 8;

export const OnlineStoreArticlesSlider = ({
  articles,
  lang,
  formatter,
  texts,
  commissionValue,
}: {
  articles: CustomArticleSecondChance[];
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number | null;
  texts: { price: string };
}) => {
  const listRef = useRef<FlatList<CustomArticleSecondChance[]>>(null);
  const [page, setPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const pages = useMemo(() => {
    const result: CustomArticleSecondChance[][] = [];

    for (let i = 0; i < articles.length; i += 2) {
      result.push(articles.slice(i, i + 2));
    }

    return result;
  }, [articles]);

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    setPageWidth(e.nativeEvent.layout.width);
  };

  const cardWidth = pageWidth > 0 ? (pageWidth - ITEMS_GAP) / 2 : 0;

  const scrollToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, index));

    listRef.current?.scrollToOffset({
      offset: clamped * pageWidth,
      animated: true,
    });

    setPage(clamped);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;

    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / pageWidth);
    setPage(next);
  };

  if (articles.length === 0) return null;

  return (
    <View className='w-full px-2'>
      <View
        className='overflow-hidden'
        onLayout={handleTrackLayout}
      >
        {pageWidth > 0 && (
          <FlatList<CustomArticleSecondChance[]>
            ref={listRef}
            data={pages}
            keyExtractor={(_, index) => `page-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate='fast'
            snapToInterval={pageWidth}
            snapToAlignment='start'
            disableIntervalMomentum
            bounces={false}
            overScrollMode='never'
            onMomentumScrollEnd={onMomentumEnd}
            getItemLayout={(_, index) => ({
              length: pageWidth,
              offset: pageWidth * index,
              index,
            })}
            renderItem={({ item: pageArticles }) => (
              <View
                style={{ width: pageWidth }}
                className='flex-row'
              >
                {pageArticles.map((article, idx) => (
                  <View
                    key={article.id}
                    style={{
                      width: cardWidth,
                      marginRight: idx === 0 ? ITEMS_GAP : 0,
                    }}
                  >
                    <OnlineStoreArticleItem
                      onlineStoreArticle={article}
                      formatter={formatter}
                      texts={{ price: texts.price }}
                      commissionValue={commissionValue}
                    />
                  </View>
                ))}

                {pageArticles.length === 1 && (
                  <View style={{ width: cardWidth }} />
                )}
              </View>
            )}
          />
        )}
      </View>

      <View className='mt-2 flex-row items-center justify-between px-4'>
        <Pressable
          onPress={() => scrollToPage(page - 1)}
          disabled={page <= 0}
          className='h-10 w-10 items-center justify-center rounded-full disabled:opacity-50'
          accessibilityLabel='Previous article page'
          accessibilityHint='Navigates to the previous page in the slider'
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
          {pages.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              className={
                idx === page
                  ? 'h-2 w-2 rounded-full bg-cinnabar'
                  : 'h-2 w-2 rounded-full bg-neutral-600'
              }
              accessibilityRole='progressbar'
              accessibilityLabel={`Page ${page + 1} of ${pages.length}`}
            />
          ))}
        </View>

        <Pressable
          onPress={() => scrollToPage(page + 1)}
          disabled={page >= pages.length - 1}
          className='h-10 w-10 items-center justify-center rounded-full disabled:opacity-50'
          accessibilityLabel='Next article page'
          accessibilityHint='Navigates to the next page in the slider'
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
