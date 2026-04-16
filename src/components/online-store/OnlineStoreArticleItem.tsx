import { useMemo } from 'react';
import { View } from 'react-native';
import { CustomArticleSecondChance } from '@/types/types';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { AMOUNT_PLACEHOLDER, ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

type OnlineStoreArticleItemProps = {
  onlineStoreArticle: CustomArticleSecondChance;
  formatter: Intl.NumberFormat;
  texts: {
    price: string;
  };
  commissionValue: number | null;
};

export function OnlineStoreArticleItem({
  onlineStoreArticle,
  formatter,
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
    <View className='w-full'>
      <CustomLink
        className='w-full'
        href={`/(tabs)/online-store/articles/${articleId}`}
        mode='empty'
      >
        <View className='aspect-square w-full overflow-hidden rounded-xl'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='h-full w-full'
            resizeMode='cover'
          />
        </View>

        <View className='mt-2 pr-1'>
          <CustomText type='subtitle'>
            {`${texts.price} ${
              commissionValue !== null
                ? formatter.format(commissionedPrice)
                : AMOUNT_PLACEHOLDER
            }`}
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
            numberOfLines={2}
          >
            {article.title}
          </CustomText>
        </View>
      </CustomLink>
    </View>
  );
}
