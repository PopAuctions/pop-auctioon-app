import { CustomArticle, Lang } from '@/types/types';
import React from 'react';
import { View } from 'react-native';
import { CustomImage } from '../ui/CustomImage';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { ceilToNearestTen } from '@/utils/ceilToNearestTen';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

type Props = {
  article: CustomArticle;
  texts: { paymentAmount: string; view: string };
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionPercentage: number;
};

export function PaidArticleItem({
  article,
  texts,
  formatter,
  commissionPercentage,
}: Props) {
  if (!article.images || article.images.length === 0) {
    return null;
  }

  const articlePaymentAmount =
    commissionPercentage === undefined
      ? article.soldPrice
      : ceilToNearestTen(
          getArticleCommissionedPrice(article.soldPrice, commissionPercentage)
        );

  return (
    <View className='flex w-full flex-row gap-5'>
      <View className='flex w-1/2 justify-center overflow-hidden rounded-lg'>
        <CustomImage
          src={article.images[0]}
          alt={article.title}
          className='aspect-square w-full'
          resizeMode='cover'
        />
      </View>

      <View className='flex w-1/2 flex-col justify-between space-y-2'>
        <View>
          <CustomText type='body'>{article.id}</CustomText>
          <CustomText type='subtitle'>
            {`${texts.paymentAmount} ${formatter.format(articlePaymentAmount)}`}
          </CustomText>
          <CustomText type='h4'>{article.title}</CustomText>
        </View>

        <View className='w-1/2'>
          <CustomLink
            mode='secondary'
            size='small'
            href={`/(tabs)/auctions/articles/${article.id}`}
          >
            {texts.view}
          </CustomLink>
        </View>
      </View>
    </View>
  );
}
