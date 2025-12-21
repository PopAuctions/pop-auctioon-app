import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

const ITEMS_GAP = 32;

export const ArticleSliderSkeleton = () => {
  const { width } = useWindowDimensions();

  const CARD_W = Math.min(width - 48, Math.round(width * 0.95));
  const SIDE_PADDING = Math.round((width - CARD_W) / 2);

  const HALF_W = Math.floor(CARD_W / 2);
  const IMAGE_SIZE = HALF_W;

  return (
    <View className='w-full'>
      <View
        style={{ paddingHorizontal: SIDE_PADDING }}
        className='flex-row'
      >
        <View
          style={{ width: CARD_W }}
          className='w-full'
        >
          <View
            className='flex-row'
            style={{ gap: 20 }}
          >
            <SkeletonBlock
              className='rounded-xl'
              style={{
                width: HALF_W,
                height: IMAGE_SIZE,
              }}
            />

            <View
              style={{ width: HALF_W }}
              className='justify-between'
            >
              <View style={{ gap: 10 }}>
                <SkeletonBlock
                  style={{ width: Math.min(150, HALF_W - 8), height: 16 }}
                />

                <SkeletonBlock
                  style={{ width: Math.min(180, HALF_W - 8), height: 18 }}
                />

                <SkeletonBlock
                  style={{ width: Math.min(160, HALF_W - 8), height: 22 }}
                />
                <SkeletonBlock
                  style={{ width: Math.min(120, HALF_W - 8), height: 22 }}
                />

                <SkeletonBlock
                  style={{ width: Math.min(110, HALF_W - 8), height: 16 }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{ width: ITEMS_GAP }} />
      </View>

      <View className='mt-3 flex-row items-center justify-between px-4'>
        <SkeletonBlock style={{ width: 40, height: 40, borderRadius: 9999 }} />

        <View
          className='flex-row items-center'
          style={{ gap: 8 }}
        >
          <SkeletonBlock
            pulse={false}
            style={{ width: 8, height: 8, borderRadius: 9999 }}
          />
          <SkeletonBlock
            pulse={false}
            style={{ width: 8, height: 8, borderRadius: 9999 }}
          />
          <SkeletonBlock
            pulse={false}
            style={{ width: 8, height: 8, borderRadius: 9999 }}
          />
        </View>

        <SkeletonBlock style={{ width: 40, height: 40, borderRadius: 9999 }} />
      </View>
    </View>
  );
};
