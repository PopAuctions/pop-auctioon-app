import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../ui/SkeletonBlock';

export const LiveCurrentArticleCardSkeleton = ({
  height = 36,
}: {
  height?: number;
}) => {
  return (
    <View
      className='flex w-full'
      style={{ height }}
    >
      <SkeletonBlock
        className='flex-1'
        style={{ height }}
      />
    </View>
  );
};
