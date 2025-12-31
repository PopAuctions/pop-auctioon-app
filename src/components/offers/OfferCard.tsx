import React from 'react';
import { View } from 'react-native';
import {
  ArticleSecondChanceStatusConst,
  OfferStatusConst,
  OfferStatusLabels,
  type Lang,
  type MyOffers,
} from '@/types/types';
import { CustomLink } from '../ui/CustomLink';
import { CustomImage } from '../ui/CustomImage';
import { CustomText } from '../ui/CustomText';
import { Badge } from '../ui/Badge';
import { euroFormatter } from '@/utils/euroFormatter';

interface OfferCardProps {
  offer: MyOffers;
  lang: Lang;
  texts: {
    alreadySold: string;
    payNow: string;
    offerExpired: string;
  };
}

export const OfferCard = ({ offer, lang, texts }: OfferCardProps) => {
  const { ArticleSecondChance: articleSecondChance, amount, status } = offer;
  const article = articleSecondChance?.Article;
  const formatter = euroFormatter(lang);

  if (!article?.images?.[0]) return null;

  const statusVariant =
    status === OfferStatusConst.ACCEPTED
      ? 'default'
      : status === OfferStatusConst.PENDING
        ? 'destructive'
        : 'secondary';

  const hasExpired = new Date(offer.expiresAt) < new Date();

  return (
    <View className='flex w-full flex-row gap-5 md:max-w-[200px] md:flex-col md:gap-0'>
      {/* IMAGE */}
      <CustomLink
        href={`/online-store/article/${articleSecondChance.id}`}
        className='w-1/2 justify-center overflow-hidden rounded-lg md:w-full'
      >
        <View className='w-full items-center justify-center overflow-hidden rounded-lg'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='aspect-square w-full'
            resizeMode='cover'
          />
        </View>
      </CustomLink>

      {/* CONTENT */}
      <View className='flex w-1/2 flex-col justify-around space-y-4 md:w-full'>
        <View>
          <CustomText
            type='subtitle'
            className='font-semibold'
          >
            {article.title}
          </CustomText>

          <CustomText type='body'>{formatter.format(amount)}</CustomText>

          {articleSecondChance.status ===
            ArticleSecondChanceStatusConst.SOLD && (
            <CustomText
              type='body'
              className='text-cinnabar'
            >
              {texts.alreadySold}
            </CustomText>
          )}
        </View>

        {articleSecondChance.status !== ArticleSecondChanceStatusConst.SOLD && (
          <Badge
            variant={statusVariant}
            className='self-start'
          >
            {OfferStatusLabels[lang][status]}
          </Badge>
        )}

        {/* ACTION (PAY / EXPIRED) */}
        {status === OfferStatusConst.ACCEPTED &&
          articleSecondChance.status !==
            ArticleSecondChanceStatusConst.SOLD && (
            <>
              {hasExpired ? (
                <CustomText
                  type='body'
                  className='text-cinnabar'
                >
                  {texts.offerExpired}
                </CustomText>
              ) : (
                <CustomLink
                  href={`/(tabs)/account/single-payment?articleId=${articleSecondChance.id}`}
                  mode='primary'
                  size='small'
                >
                  {texts.payNow}
                </CustomLink>
              )}
            </>
          )}
      </View>
    </View>
  );
};
