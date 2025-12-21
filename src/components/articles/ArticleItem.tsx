import { useMemo } from 'react';
import { View } from 'react-native';
import { Lang, SimpleArticle } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { AMOUNT_PLACEHOLDER, ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '../ui/CustomImage';
import { SimpleCountdown } from '../ui/SimpleCountdown';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { FollowButton } from '../ui/FollowButton';

type ArticleItemProps = {
  article: SimpleArticle;
  auctionLang: {
    currentBid: string;
  };
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number | null;
  userFollows?: boolean;
  showFollowButton?: boolean;
  actionAfterFollow?: () => void;
};

export function ArticleItem({
  article,
  auctionLang,
  formatter,
  lang,
  commissionValue,
  userFollows = false,
  showFollowButton = true,
  actionAfterFollow = () => {},
}: ArticleItemProps) {
  const articleId = article.id;
  const price = article.ArticleBid.currentValue;

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
        className='flex w-full flex-row gap-5'
        href={`/(tabs)/auctions/articles/${article.id}`}
        mode='empty'
      >
        <View className='aspect-square w-1/2 items-center overflow-hidden rounded-xl'>
          <CustomImage
            src={article.images[0]}
            alt={article.title}
            className='h-full w-full'
            resizeMode='cover'
          />
        </View>

        <View className='w-1/2 flex-col items-start justify-between'>
          <View className='flex flex-col pr-2'>
            {article.whenInAuction && (
              <SimpleCountdown
                dateString={
                  typeof article.whenInAuction === 'string'
                    ? article.whenInAuction
                    : article.whenInAuction.toISOString()
                }
                locale={lang}
                texts={{
                  completed: { es: 'Ya comenzó', en: 'Already started' },
                }}
              />
            )}

            <CustomText type='subtitle'>
              {`${auctionLang.currentBid} ${commissionedPrice !== null ? formatter.format(commissionedPrice) : AMOUNT_PLACEHOLDER}`}
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
              {
                ARTICLE_BRANDS_LABELS[
                  article.brand as keyof typeof ARTICLE_BRANDS_LABELS
                ]
              }
            </CustomText>
          </View>

          {showFollowButton && (
            <FollowButton
              className='w-2/3 enabled:hover:cursor-pointer disabled:opacity-50'
              mode='primary'
              size='large'
              follows={userFollows}
              followEndpoint={`/articles/${articleId}/follow`}
              unfollowEndpoint={`/articles/${articleId}/unfollow`}
              lang={lang}
              isAvailable={article.sold}
              extraDataIsLoaded={true}
              actionAfterFollow={actionAfterFollow}
            />
          )}
        </View>
      </CustomLink>
    </View>
  );
}
