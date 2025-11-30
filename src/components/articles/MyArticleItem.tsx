import { useMemo } from 'react';
import { View } from 'react-native';
import { Lang, Article } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import {
  ARTICLE_BRANDS_LABELS,
  ARTICLE_STATUS_LABELS,
  ArticleStatus,
} from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

type MyArticleItemProps = {
  article: Article;
  auctionLang: {
    remove: string;
  };
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number;
};

export function MyArticleItem({
  article,
  auctionLang,
  formatter,
  lang,
  commissionValue,
}: MyArticleItemProps) {
  const price = article.ArticleBid.currentValue;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue),
    [price, commissionValue]
  );

  const statusColor =
    article.status === ArticleStatus.NEED_CHANGES
      ? 'text-[#ff0000]'
      : article.status === ArticleStatus.PUBLISHED
        ? 'text-green-600'
        : 'text-black';

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='flex w-full gap-5 px-5'>
      <View className='aspect-square w-2/3 self-center overflow-hidden rounded-xl'>
        <CustomImage
          src={article.images[0]}
          alt={article.title}
          className='h-full w-full'
          resizeMode='cover'
        />
      </View>

      <View className='flex-col items-start'>
        <View className='flex flex-col'>
          <CustomText
            type='body'
            className='text-cinnabar'
          >
            {article.id}
          </CustomText>

          <CustomText
            type='h4'
            className={statusColor}
          >
            {ARTICLE_STATUS_LABELS[lang][article.status]}
          </CustomText>
          <CustomText
            type='h4'
            className=''
          >
            {article.title} |{' '}
            {
              ARTICLE_BRANDS_LABELS[
                article.brand as keyof typeof ARTICLE_BRANDS_LABELS
              ]
            }
          </CustomText>
          <CustomText
            type='subtitle'
            className='text-lg'
          >
            {formatter.format(commissionedPrice)}
          </CustomText>
        </View>
      </View>
    </View>
  );
}
