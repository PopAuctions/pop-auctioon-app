import React, { useMemo } from 'react';
import { Image, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import type { CustomArticleLiveAuto, Lang } from '@/types/types';
import { useHighestBidderContext } from '@/context/highest-bidder-context';
import { CustomText } from '../ui/CustomText';

interface LiveCurrentArticleCardProps {
  article: CustomArticleLiveAuto;
  lang: Lang;
}

const UI = {
  IMAGE_SIZE: 64,
  IMAGE_RADIUS: 12,
} as const;

export const LiveCurrentArticleCard = ({
  article,
  lang,
}: LiveCurrentArticleCardProps) => {
  const { state } = useHighestBidderContext({});
  const formatter = useMemo(() => euroFormatter(lang), [lang]);

  const title = article.title;
  const brand = article.brand;
  const estimatedValue = article?.estimatedValue ?? null;
  const currentValue = state.currentValue ?? null;

  const currentLabel =
    currentValue != null ? formatter.format(currentValue) : '--';

  const imageUrl = article.images?.[0] || null;

  return (
    <View className='w-full flex-row items-center justify-between rounded-2xl bg-white/90 px-3 py-2'>
      {/* Left */}
      <View className='flex-1 flex-row items-center'>
        <View
          className='bg-neutral-200'
          style={{
            width: UI.IMAGE_SIZE,
            height: UI.IMAGE_SIZE,
            borderRadius: UI.IMAGE_RADIUS,
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              resizeMode='cover'
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </View>

        <View className='ml-3 flex-1'>
          <CustomText
            type='subtitle'
            className='font-extrabold text-cinnabar'
          >
            {title}
          </CustomText>

          <CustomText
            type='body'
            numberOfLines={1}
            className='font-semibold text-black'
          >
            {brand}
          </CustomText>

          {estimatedValue != null && (
            <CustomText
              type='bodysmall'
              numberOfLines={1}
              className='font-semibold text-neutral-500'
            >
              Estimated value: {formatter.format(estimatedValue)}
            </CustomText>
          )}
        </View>
      </View>

      {/* Right */}
      <View className='items-end pl-3'>
        <CustomText
          type='h4'
          className=''
        >
          Current
        </CustomText>
        <CustomText
          type='h4'
          className=''
        >
          {currentLabel}
        </CustomText>
      </View>
    </View>
  );
};
