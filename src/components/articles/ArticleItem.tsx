import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Lang, LangMap, SimpleArticle } from '@/types/types';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { AMOUNT_PLACEHOLDER, ARTICLE_BRANDS_LABELS } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { SimpleCountdown } from '@/components/ui/SimpleCountdown';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { FollowButton } from '@/components/ui/FollowButton';
import { BidButton } from '@/components/bids/BidButton';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useToast } from '@/hooks/useToast';

type ArticleItemProps = {
  article: SimpleArticle;
  auctionLang: {
    currentBid: string;
    bid?: string;
  };
  formatter: Intl.NumberFormat;
  lang: Lang;
  commissionValue: number | null;
  userFollows?: boolean;
  showFollowButton?: boolean;
  showBidButton?: boolean;
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
  showBidButton = false,
  actionAfterFollow = () => {},
}: ArticleItemProps) {
  const { securePost } = useSecureApi();
  const { callToast } = useToast(lang);
  const [isLoading, setIsLoading] = useState(false);

  const articleId = article.id;
  const price = article.ArticleBid.currentValue;

  const commissionedPrice = useMemo(
    () => getArticleCommissionedPrice(price, commissionValue ?? 0),
    [price, commissionValue]
  );

  if (!article.images || article.images.length === 0) {
    return null;
  }

  const sendBid = async ({ amount }: { amount: number }) => {
    setIsLoading(true);
    const response = await securePost<LangMap>({
      endpoint: SECURE_ENDPOINTS.BIDS.CREATE,
      data: {
        articleId,
        amount: amount,
        clientCurrentAmount: price,
      },
    });

    setIsLoading(false);
    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      return;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
  };

  return (
    <View className='w-full gap-2'>
      <CustomLink
        className='flex w-full flex-row gap-5 md:gap-8'
        href={`/(tabs)/auctions/articles/${article.id}`}
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

        <View className='w-1/2 flex-col justify-between md:w-3/5'>
          <View className='flex flex-col pr-2'>
            {showFollowButton && (
              <FollowButton
                mode='primary'
                size='large'
                heartIcon={true}
                follows={userFollows}
                followEndpoint={`/articles/${articleId}/follow`}
                unfollowEndpoint={`/articles/${articleId}/unfollow`}
                lang={lang}
                isAvailable={!article.sold}
                extraDataIsLoaded={true}
                actionAfterFollow={actionAfterFollow}
              />
            )}
            {article.whenInAuction && (
              <SimpleCountdown
                dateString={article.whenInAuction}
                locale={lang}
                texts={{
                  startSoon: { en: 'Starting soon', es: 'Comienza pronto' },
                  completed: {
                    en: 'Auction already started',
                    es: 'La subasta ya comenzó',
                  },
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

          {showBidButton && !article.sold && (
            <BidButton
              articleId={articleId}
              startingPrice={article.startingPrice}
              currentValue={commissionedPrice}
              commissionPercentage={commissionValue ?? 0}
              formatter={formatter}
              onPress={sendBid}
              text={{ bid: auctionLang.bid }}
              isLoading={isLoading}
            />
          )}
        </View>
      </CustomLink>
    </View>
  );
}
