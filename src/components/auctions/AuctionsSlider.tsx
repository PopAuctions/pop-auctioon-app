import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  useWindowDimensions,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import type { Auction, Lang } from '@/types/types';
import { AuctionsSliderItem } from './AuctionsSliderItem';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';

const ITEMS_GAP = 32;

export const AuctionsSlider = ({
  auctions,
  locale,
}: {
  auctions: Auction[];
  locale: Lang;
}) => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Auction>>(null);
  const [page, setPage] = useState(0);

  const CARD_W = Math.min(width - 48, Math.round(width * 0.72));
  const SIDE_PADDING = Math.round((width - CARD_W) / 2);

  const scrollToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(auctions.length - 1, index));
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
    <View className='w-full'>
      <FlatList<Auction>
        ref={listRef}
        data={auctions}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + ITEMS_GAP}
        snapToAlignment='start'
        decelerationRate='fast'
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
        }}
        ItemSeparatorComponent={() => <View style={{ width: ITEMS_GAP }} />}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <View style={{ width: CARD_W }}>
            <AuctionsSliderItem
              auction={item}
              lang={locale}
              cardWidth={CARD_W}
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
          {auctions.map((_, idx) => (
            <View
              key={idx}
              className={
                idx === page
                  ? 'h-2 w-2 rounded-full bg-cinnabar'
                  : 'h-2 w-2 rounded-full bg-neutral-600'
              }
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            scrollToPage(page + 1);
          }}
          disabled={page >= auctions.length - 1}
          className='h-10 w-10 items-center justify-center rounded-full disabled:opacity-50'
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
