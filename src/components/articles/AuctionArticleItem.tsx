import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { SimpleCountdown } from '../ui/SimpleCountdown';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { Button } from '../ui/Button';

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
    <View className='w-full gap-2'>
      <CustomLink
        className='flex w-full flex-row gap-5'
        href={`/(tabs)/auctions/${article.auctionId}`}
        mode='empty'
      >
        <Pressable className='w-1/2 items-center'>
          <View className='aspect-square w-full overflow-hidden rounded-xl'>
            <CustomImage
              src={article.images[0]}
              alt={article.title}
              className='h-full w-full'
              resizeMode='cover'
            />
          </View>
        </Pressable>

        <View className='w-1/2 flex-col items-start justify-between'>
          <View className='flex flex-col pr-2'>
            {article.whenInAuction && (
              <SimpleCountdown
                dateString={article.whenInAuction.toUTCString()}
                locale={lang}
                texts={{
                  completed: { es: 'Ya comenzó', en: 'Already started' },
                }}
              />
            )}

            <CustomText type='subtitle'>
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

          <Button mode='primary'>Seguir</Button>

          {/* Follow button will fit here later */}
          {/* {showFollowButton && (
          <FollowButton
            mode='primary'
            size='normal' // make sure this gives you that tall pill style
            follows={userFollows}
            id={String(article.id)}
            followFunction={followArticle}
            unfollowFunction={unfollowArticle}
            lang={lang}
            isAvailable={article.sold}
            className='mt-6 w-full rounded-xl'
          >
            {userFollows ? auctionLang.unfollow : auctionLang.follow}
          </FollowButton>
        )} */}
        </View>
      </CustomLink>
    </View>
  );
}
