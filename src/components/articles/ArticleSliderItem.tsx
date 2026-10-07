import { useMemo } from 'react';
import { View } from 'react-native';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { AMOUNT_PLACEHOLDER } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { SimpleCountdown } from '@/components/ui/SimpleCountdown';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { ceilToNearestTen } from '@/utils/ceilToNearestTen';
import { t } from '@/i18n';

type ArticleItemProps = {
  article: SimpleArticle;
  auctionLang: {
    currentBid: string;
  };
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number | null;
};

export function ArticleSliderItem({
  article,
  auctionLang,
  formatter,
  lang,
  commissionValue,
}: ArticleItemProps) {
  const countdownTexts = t('components.simpleCountdown', { locale: lang });
  const articleId = article.id;
  const price = article.ArticleBid.currentValue;

  const commissionedPrice = useMemo(
    () =>
      ceilToNearestTen(
        getArticleCommissionedPrice(price, commissionValue ?? 0)
      ),
    [price, commissionValue]
  );

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='w-full'>
      <CustomLink
        className='w-full gap-2'
        href={`/(tabs)/auctions/articles/${articleId}`}
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

        <View>
          {article.whenInAuction && (
            <SimpleCountdown
              dateString={article.whenInAuction}
              texts={{
                startSoon: countdownTexts.articleStartSoon,
                completed: countdownTexts.completed,
              }}
            />
          )}

          <CustomText type='subtitle'>
            {`${auctionLang.currentBid} ${
              commissionedPrice !== null
                ? formatter.format(commissionedPrice)
                : AMOUNT_PLACEHOLDER
            }`}
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
