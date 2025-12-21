import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';

export const ArticleSliderSkeleton = () => {
  const { width } = useWindowDimensions();

  const CARD_W = Math.min(width - 48, Math.round(width * 0.95));
  const SIDE_PADDING = Math.round((width - CARD_W) / 2);
  const imageH = Math.round(CARD_W * 1.05);

  return (
    <View className='w-full'>
      <View
        style={{ paddingHorizontal: SIDE_PADDING }}
        className='flex-row'
      >
        {/* Main card */}
        <View style={{ width: CARD_W }}>
          <SkeletonBlock
            style={{ width: '100%', height: imageH, borderRadius: 12 }}
          />

          <View
            className='mt-4'
            style={{ gap: 10 }}
          >
            <SkeletonBlock style={{ width: 170, height: 18 }} />
            <SkeletonBlock style={{ width: 140, height: 14 }} />
            <SkeletonBlock
              style={{ width: Math.min(220, CARD_W), height: 22 }}
            />
          </View>
        </View>

        <View style={{ width: Math.round(CARD_W * 0.45) }}>
          <SkeletonBlock
            style={{
              width: '100%',
              height: Math.round(imageH * 0.65),
              borderRadius: 12,
            }}
          />
        </View>
      </View>

      {/* Controls */}
      <View className='mt-5 flex-row items-center justify-between px-4'>
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
        </View>

        <SkeletonBlock style={{ width: 40, height: 40, borderRadius: 9999 }} />
      </View>
    </View>
  );
};
