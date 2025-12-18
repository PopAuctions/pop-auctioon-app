import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter'; // adjust if you have one
import { CustomArticleLiveAuto } from '@/types/types';

type Props = {
  article: CustomArticleLiveAuto | null;
  lang: string;
};

const UI = {
  IMAGE_SIZE: 56,
  IMAGE_RADIUS: 12,
} as const;

export const LiveCurrentArticleCard = ({ article, lang }: Props) => {
  const formatter = useMemo(() => euroFormatter(lang as any), [lang]);

  if (!article) return null;

  const title = article.title ?? '';
  const brand = article.brand ?? '';
  const estimatedValue = article.estimatedValue ?? null;
  const currentValue = article.currentValue ?? null;

  const estimatedLabel =
    estimatedValue != null ? formatter.format(estimatedValue) : '--';

  const currentLabel =
    currentValue != null ? formatter.format(currentValue) : '--';

  // pick the correct image field from your model
  const imageUrl =
    article.coverImageUrl ||
    article.featuredImageUrl ||
    article.images?.[0] ||
    null;

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
          <Text
            numberOfLines={1}
            className='text-[15px] font-extrabold text-neutral-900'
          >
            {title}
          </Text>

          <Text
            numberOfLines={1}
            className='text-[13px] font-semibold text-neutral-600'
          >
            {brand}
          </Text>

          <Text className='text-[12px] font-semibold text-neutral-500'>
            Est: {estimatedLabel}
          </Text>
        </View>
      </View>

      {/* Right */}
      <View className='items-end pl-3'>
        <Text className='text-[11px] font-bold text-neutral-500'>Current</Text>
        <Text className='text-[16px] font-extrabold text-neutral-900'>
          {currentLabel}
        </Text>
      </View>
    </View>
  );
};
