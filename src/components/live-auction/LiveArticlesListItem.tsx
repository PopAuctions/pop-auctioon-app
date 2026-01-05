import React, { useMemo } from 'react';
import { View } from 'react-native';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { CustomText } from '@/components/ui/CustomText';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomArticleLiveAuto } from '@/types/types';

type Props = {
  article: CustomArticleLiveAuto;
  isLive: boolean;
  index: number;
  commissionValue: number;
  formatter: Intl.NumberFormat;
  texts: { bids: string; estimatedPrice: string; liveNow: string };
};

export const LiveArticlesListItem = ({
  article,
  isLive,
  index,
  commissionValue,
  formatter,
  texts,
}: Props) => {
  const price = article.ArticleBid.currentValue;
  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue),
    [price, commissionValue]
  );

  const bidsAmount = article?.Bids?.[0]?.count ?? 0;
  const isAvailable = article.ArticleBid.available;

  const imageSrc = article.images?.[0];
  if (!imageSrc) return null;

  return (
    <View
      className={[
        'border-gray-200 relative border-b p-4',
        isLive ? 'bg-red-100/50' : 'bg-white/50',
        !isAvailable ? 'opacity-50' : '',
      ].join(' ')}
    >
      <View
        className='flex-row'
        style={{ gap: 12 }}
      >
        <View className='overflow-hidden rounded-xl'>
          <CustomImage
            src={imageSrc}
            alt={article.title}
            className='h-[75px] w-[75px]'
            resizeMode='cover'
          />
        </View>

        <View className='flex-1'>
          {isLive ? (
            <View className='mb-1 self-start rounded-full border border-cinnabar px-2 py-1'>
              <CustomText type='bodysmall'>{texts.liveNow}</CustomText>
            </View>
          ) : null}

          <View className='flex-row flex-wrap'>
            <CustomText type='body'>{article.id}:</CustomText>
            <CustomText type='body'> {article.title}</CustomText>
          </View>

          {article.estimatedValue ? (
            <CustomText type='bodysmall'>
              {texts.estimatedPrice} {formatter.format(article.estimatedValue)}
            </CustomText>
          ) : null}

          {!isLive ? (
            <View className='mt-2 flex-row items-center justify-between'>
              <CustomText type='body'>
                {formatter.format(commissionedPrice)}
              </CustomText>

              {isAvailable ? (
                <CustomText type='bodysmall'>
                  ({bidsAmount} {texts.bids}
                  {bidsAmount !== 1 ? 's' : ''})
                </CustomText>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {/* index top-right */}
      <View className='absolute right-2 top-2'>
        <CustomText type='bodysmall'>{index}</CustomText>
      </View>
    </View>
  );
};
