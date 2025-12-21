import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Auction, Lang } from '@/types/types';
import { AuctionsSliderItem } from './AuctionsSliderItem';

export const AuctionsSlider = ({
  auctions,
  locale,
}: {
  auctions: Auction[];
  locale: Lang;
}) => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Auction[]>>(null);
  const [page, setPage] = useState(0);

  // crude “lg” breakpoint (tweak if you want)
  const isLarge = width >= 1024;

  // mimic web logic:
  // - if > 3 => always carousel
  // - else => on large show row, on small show carousel
  const useCarousel = auctions.length > 3 || !isLarge;

  // how many cards per “page” on large screens (like md 1/2, lg 1/3)
  const cardsPerPage = isLarge ? 3 : 1;

  const pages = useMemo(() => {
    if (!useCarousel) return [];
    const chunks: Auction[][] = [];
    for (let i = 0; i < auctions.length; i += cardsPerPage) {
      chunks.push(auctions.slice(i, i + cardsPerPage));
    }
    return chunks;
  }, [auctions, cardsPerPage, useCarousel]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setPage(next);
  };

  if (!useCarousel) {
    // Large screen row (like your "lg:flex" layout)
    return (
      <View
        className='w-full flex-row justify-center'
        style={{ gap: 16 }}
      >
        {auctions.map((auction) => (
          <View
            key={auction.id}
            style={{ width: width / 3.2 }}
          >
            <AuctionsSliderItem
              auction={auction}
              lang={locale}
            />
          </View>
        ))}
      </View>
    );
  }

  // Carousel mode (horizontal paging)
  return (
    <View className='w-full'>
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(_, idx) => `page-${idx}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item: pageAuctions }) => (
          <View
            style={{ width }}
            className='flex-row justify-center'
          >
            <View
              className='w-full flex-row justify-center px-4'
              style={{ gap: 16 }}
            >
              {pageAuctions.map((auction) => (
                <View
                  key={auction.id}
                  style={{ width: isLarge ? width / 3.2 : width - 32 }}
                >
                  <AuctionsSliderItem
                    auction={auction}
                    lang={locale}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      />

      {/* Arrows */}
      <View className='mt-3 flex-row items-center justify-between px-4'>
        <Pressable
          onPress={() => {
            const prev = Math.max(0, page - 1);
            listRef.current?.scrollToIndex({ index: prev, animated: true });
            setPage(prev);
          }}
          className='h-10 w-10 items-center justify-center rounded-full'
        >
          <Ionicons
            name='chevron-back'
            size={28}
            color='#e44'
          />
        </Pressable>

        {/* Dots */}
        <View
          className='flex-row items-center'
          style={{ gap: 8 }}
        >
          {pages.map((_, idx) => (
            <View
              key={idx}
              className={
                idx === page
                  ? 'h-2 w-2 rounded-full bg-cinnabar'
                  : 'bg-gray-300 h-2 w-2 rounded-full'
              }
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            const next = Math.min(pages.length - 1, page + 1);
            listRef.current?.scrollToIndex({ index: next, animated: true });
            setPage(next);
          }}
          className='h-10 w-10 items-center justify-center rounded-full'
        >
          <Ionicons
            name='chevron-forward'
            size={28}
            color='#e44'
          />
        </Pressable>
      </View>
    </View>
  );
};
