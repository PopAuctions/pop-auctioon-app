import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../ui/SkeletonBlock';

export const BidSliderSkeleton = ({ height = 36 }: { height?: number }) => {
  return (
    <View
      className='flex w-full flex-row gap-3'
      style={{ height }}
    >
      <SkeletonBlock
        className='flex-1'
        style={{ height }}
      />
      <SkeletonBlock
        className='flex-[2]'
        style={{ height }}
      />
    </View>
  );
};
