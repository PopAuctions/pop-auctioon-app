import { useMemo } from 'react';
import { View } from 'react-native';
import {
  ArticleSecondChanceStatus,
  CustomArticleSecondChance,
  Lang,
} from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import {
  AMOUNT_PLACEHOLDER,
  ARTICLE_BRANDS_LABELS,
  ArticleSecondChanceStatusConst,
  ONLINE_STORE_ARTICLE_STATUS_LABELS,
} from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

type MyOnlineStoreArticleItemProps = {
  onlineStoreArticle: CustomArticleSecondChance;
  formatter: Intl.NumberFormat;
  texts: {
    price: string;
    offersText: string;
    checkDetails: string;
    viewInStore: string;
  };
  lang: Lang;
  commissionValue: number | null;
};

export function MyOnlineStoreArticleItem({
  onlineStoreArticle,
  formatter,
  lang,
  texts,
  commissionValue,
}: MyOnlineStoreArticleItemProps) {
  const articleId = onlineStoreArticle.id;
  const article = onlineStoreArticle.Article;
  const price = onlineStoreArticle.price;
  const articleOffers = onlineStoreArticle?.ArticleOffer?.length ?? 0;
  const isSold =
    onlineStoreArticle.status === ArticleSecondChanceStatusConst.SOLD;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue ?? 0),
    [price, commissionValue]
  );

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='w-full gap-2'>
      <View className='flex w-full flex-row gap-2'>
        <View className='aspect-square w-2/5 items-center overflow-hidden rounded-xl'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='h-full w-full'
            resizeMode='cover'
          />
        </View>

        <View className='w-3/5 flex-col items-start justify-between'>
          <View className='flex flex-col pr-2'>
            <CustomText type='subtitle'>
              {`${texts.price} ${commissionValue !== null ? formatter.format(commissionedPrice) : AMOUNT_PLACEHOLDER}`}
            </CustomText>

            <CustomText
              type='body'
              className='text-cinnabar'
            >
              {ARTICLE_BRANDS_LABELS[
                article.brand as keyof typeof ARTICLE_BRANDS_LABELS
              ] ??
                article.brand ??
                ''}
            </CustomText>
            <CustomText
              type='h4'
              className='text-black'
            >
              {article.title}
            </CustomText>

            <CustomText
              type='subtitle'
              className='text-start text-cinnabar'
            >
              {
                ONLINE_STORE_ARTICLE_STATUS_LABELS[lang][
                  onlineStoreArticle.status as ArticleSecondChanceStatus
                ]
              }
            </CustomText>
            {articleOffers > 0 && !isSold && (
              <CustomText
                type='body'
                className='text-start'
              >
                {texts.offersText}:{' '}
                <CustomText
                  type='bodysmall'
                  className='text-cinnabar'
                >
                  {articleOffers}
                </CustomText>
              </CustomText>
            )}
          </View>
          <View className='flex flex-row gap-1'>
            <CustomLink
              href={
                isSold
                  ? '/(tabs)/account'
                  : `/(tabs)/my-online-store/articles/${articleId}`
              }
              mode='primary'
              size='small'
              textClassName='text-sm'
              className='w-1/2'
            >
              {texts.checkDetails}
            </CustomLink>
            {!isSold && (
              <CustomLink
                href={`/(tabs)/online-store/articles/${articleId}`}
                mode='secondary'
                size='small'
                textClassName='text-sm'
                className='w-1/2'
              >
                {texts.viewInStore}
              </CustomLink>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
