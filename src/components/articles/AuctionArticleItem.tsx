import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { SimpleCountdown } from '../ui/SimpleCountdown';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';

// These should be mobile-friendly functions that hit your API / Supabase
// import { followArticle } from '@/lib/articles/follow-article';
// import { unfollowArticle } from '@/lib/articles/unfollow-article';

// import { FollowButton } from '@/components/follow-button'; // RN version

type ArticleItemProps = {
  article: SimpleArticle;
  auctionLang: {
    currentBid: string;
    follow: string;
    unfollow: string;
  };
  formatter: Intl.NumberFormat;
  lang: Lang;
  userFollows: boolean;
  commissionValue: number;
  showFollowButton?: boolean;
};

export function ArticleItem({
  article,
  auctionLang,
  formatter,
  lang,
  userFollows,
  commissionValue,
  showFollowButton = true,
}: ArticleItemProps) {
  const price = article.ArticleBid.currentValue;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue),
    [price, commissionValue]
  );

  if (!article.images || article.images.length === 0) {
    return null;
  }

  return (
    <View className='flex w-full flex-row gap-5 bg-[#f4f4f4] px-4 py-6'>
      <CustomLink
        href={`/(tabs)/auctions/${article.auctionId}`}
        mode='empty'
      >
        <Pressable className='flex-[0.6]'>
          <View className='aspect-square w-full items-center justify-center rounded-xl bg-white p-3 shadow-sm'>
            <CustomImage
              src={article.images[0]}
              alt={article.title}
              className='h-full w-full'
              resizeMode='contain'
            />
          </View>
        </Pressable>
      </CustomLink>

      {/* TEXT COLUMN */}
      <View className='flex-[0.4] flex-col justify-between'>
        <View className='flex flex-col'>
          {article.whenInAuction && (
            <SimpleCountdown
              dateString={article.whenInAuction.toUTCString()}
              locale={lang}
              texts={{
                completed: { es: 'Ya comenzó', en: 'Already started' },
              }}
            />
          )}

          <CustomText
            type='subtitle'
            className='text-xs uppercase tracking-wide text-black'
          >
            {`${auctionLang.currentBid} ${formatter.format(commissionedPrice)}`}
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

        {/* follow button can live here later */}
      </View>
    </View>
  );
}
