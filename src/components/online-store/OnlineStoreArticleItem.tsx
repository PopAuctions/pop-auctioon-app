import { useMemo } from 'react';
import { View } from 'react-native';
import { CustomArticleSecondChance, Lang } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { AMOUNT_PLACEHOLDER, ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

type OnlineStoreArticleItemProps = {
  onlineStoreArticle: CustomArticleSecondChance;
  formatter: Intl.NumberFormat;
  texts: {
    price: string;
  };
  lang: Lang;
  commissionValue: number | null;
};

export function OnlineStoreArticleItem({
  onlineStoreArticle,
  formatter,
  lang,
  texts,
  commissionValue,
}: OnlineStoreArticleItemProps) {
  const articleId = onlineStoreArticle.id;
  const article = onlineStoreArticle.Article;
  const price = onlineStoreArticle.price;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue ?? 0),
    [price, commissionValue]
  );

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='w-full gap-2'>
      <CustomLink
        className='flex w-full flex-row gap-5 md:gap-8'
        href={`/(tabs)/online-store/articles/${articleId}`}
        mode='empty'
      >
        <View className='aspect-square w-1/2 items-center overflow-hidden rounded-xl md:w-2/5'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='h-full w-full'
            resizeMode='cover'
          />
        </View>

        <View className='w-1/2 flex-col items-start justify-between md:w-3/5'>
          <View className='flex flex-col pr-2'>
            <CustomText type='subtitle'>
              {`${texts.price} ${commissionValue !== null ? formatter.format(commissionedPrice) : AMOUNT_PLACEHOLDER}`}
            </CustomText>

            <CustomText
              type='h4'
              className='text-black'
            >
              {article.title}
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
          </View>
        </View>
      </CustomLink>
    </View>
  );
}
