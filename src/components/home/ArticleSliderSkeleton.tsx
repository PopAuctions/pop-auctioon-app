import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

const ITEMS_GAP = 16;

export const ArticleSliderSkeleton = () => {
  const { width } = useWindowDimensions();

  const CONTAINER_W = width - 16; // px-2 => 8 left + 8 right
  const CARD_W = (CONTAINER_W - ITEMS_GAP) / 2;
  const IMAGE_SIZE = CARD_W;

  return (
    <View className='w-full px-2'>
      <View className='flex-row overflow-hidden'>
        {[0, 1].map((item, idx) => (
          <View
            key={item}
            style={{
              width: CARD_W,
              marginRight: idx === 0 ? ITEMS_GAP : 0,
            }}
            className='overflow-hidden'
          >
            <View className='w-full gap-2'>
              <SkeletonBlock
                className='rounded-xl'
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                }}
              />

              <View className='gap-1'>
                <SkeletonBlock
                  style={{
                    width: Math.min(110, CARD_W * 0.7),
                    height: 18,
                  }}
                />

                <SkeletonBlock
                  style={{
                    width: Math.min(140, CARD_W * 0.85),
                    height: 16,
                  }}
                />

                <SkeletonBlock
                  style={{
                    width: Math.min(150, CARD_W * 0.9),
                    height: 24,
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className='mt-3 flex-row items-center justify-between px-4'>
        <SkeletonBlock style={{ width: 30, height: 30, borderRadius: 9999 }} />

        <View
          className='flex-row items-center'
          style={{ gap: 8 }}
        >
          <SkeletonBlock
            pulse={false}
            style={{ width: 12, height: 12, borderRadius: 9999 }}
          />
          <SkeletonBlock
            pulse={false}
            style={{ width: 12, height: 12, borderRadius: 9999 }}
          />
          <SkeletonBlock
            pulse={false}
            style={{ width: 12, height: 12, borderRadius: 9999 }}
          />
        </View>

        <SkeletonBlock style={{ width: 30, height: 30, borderRadius: 9999 }} />
      </View>
    </View>
  );
};
