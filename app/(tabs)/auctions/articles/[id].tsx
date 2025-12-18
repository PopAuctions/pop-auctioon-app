import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetArticle } from '@/hooks/pages/article/useGetArticle';
import { ARTICLE_BRANDS_LABELS, REQUEST_STATUS } from '@/constants';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { AuctionStatus } from '@/constants/auctions';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomLink } from '@/components/ui/CustomLink';
import { ImagesCarousel } from '@/components/ui/ImagesCarousel';
import { CurrentBidInfoArticlePage } from '@/components/articles/CurrentBidInfoArticlePage';
import { ArticleSpecificationsSection } from '@/components/articles/ArticleSpecificationsSection';
import { formatTextToParagraph } from '@/utils/formatTextToParagraph';
import { SendBid } from '@/components/bids/SendBid';
import { HighestBidderProvider } from '@/context/highest-bidder-context';
import { useGetArticlePageData } from '@/hooks/pages/article/useGetArticlePageData';
import { ArticleBidSubscriber } from '@/components/subscribers/ArticleBidSubscriber';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';
import { FollowButton } from '@/components/ui/FollowButton';
import { ArticleBidsRecord } from '@/components/articles/ArticleBidsRecord';
import { parseNumber } from '@/utils/parse-number';
import { useFetchCommissions } from '@/hooks/components/useFetchCommissions';

export default function ArticlesDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auctionLang = t('screens.auction');
  const articleLang = t('screens.article');
  const bidsLang = t('components.bid');
  const articleId = Number(id);

  const { data: commissionData, status: commissionStatus } =
    useFetchCommissions();
  const {
    data: article,
    status,
    errorMessage,
    refetch: refetchArticle,
  } = useGetArticle({
    articleId,
    validateAuctionStatus: true,
    publishedArticle: true,
    getAuctionData: true,
  });

  const {
    data: articlePageData,
    status: articlePageStatus,
    refetch,
  } = useGetArticlePageData({
    articleId: Number(id),
    auctionId: article?.Auction.id || 0,
    currentPrice: article?.ArticleBid?.currentValue || 0,
    startingPrice: article?.startingPrice || 0,
  });

  const [
    { follows = false } = {},
    { previousArticleId, nextArticleId } = {},
    biddingAmounts,
  ] = (articlePageData ?? []) as any[];
  const extraDataIsLoaded =
    articlePageStatus === REQUEST_STATUS.success ||
    articlePageStatus === REQUEST_STATUS.error;

  const isCommissionReady = commissionStatus === REQUEST_STATUS.success;

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !article || !article?.images) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }
  const auction = article.Auction;
  const articleBid = article.ArticleBid;

  return (
    <HighestBidderProvider>
      <ScrollView className='w-full'>
        <View className='mx-auto w-full max-w-[672px] px-5 md:max-w-[896px]'>
          <View className='mt-2 w-full flex-row justify-end'>
            <View className='flex flex-row gap-6'>
              {!previousArticleId ? (
                <View className='items-center justify-center opacity-50'>
                  <FontAwesomeIcon
                    variant='light'
                    name='arrow-left'
                    size={25}
                    color='#4d4d4d'
                  />
                </View>
              ) : (
                <View className='items-center justify-center'>
                  <CustomLink
                    mode='empty'
                    href={`/(tabs)/auctions/articles/${previousArticleId}`}
                    className='hover:scale-110'
                  >
                    <FontAwesomeIcon
                      variant='light'
                      name='arrow-left'
                      size={25}
                      color='cinnabar'
                    />
                  </CustomLink>
                </View>
              )}

              {!nextArticleId ? (
                <View className='items-center justify-center opacity-50'>
                  <FontAwesomeIcon
                    variant='light'
                    name='arrow-right'
                    size={25}
                    color='#4d4d4d'
                  />
                </View>
              ) : (
                <View className='items-center justify-center'>
                  <CustomLink
                    mode='empty'
                    href={`/(tabs)/auctions/articles/${nextArticleId}`}
                    className='hover:scale-110'
                  >
                    <FontAwesomeIcon
                      variant='light'
                      name='arrow-right'
                      size={25}
                      color='cinnabar'
                    />
                  </CustomLink>
                </View>
              )}
            </View>
          </View>

          {/* MAIN */}
          <View className='w-full flex-col items-center pb-16'>
            {/* SECTION: Header */}
            <View className='w-full flex-col items-center justify-center gap-2'>
              <View className='items-center'>
                <CustomText
                  type='body'
                  className='text-center text-cinnabar'
                >
                  {ARTICLE_BRANDS_LABELS[
                    article.brand as keyof typeof ARTICLE_BRANDS_LABELS
                  ] ??
                    article.brand ??
                    ''}
                </CustomText>

                <CustomText
                  type='h1'
                  className='text-center'
                >
                  {article?.title}
                </CustomText>
              </View>

              {auction.status === AuctionStatus.LIVE && (
                <CustomText
                  type='h4'
                  className='text-center text-cinnabar'
                >
                  {auctionLang.start}
                </CustomText>
              )}
              {auction.status === AuctionStatus.AVAILABLE && (
                <AuctionDisplayDateTime
                  startDate={auction.startDate}
                  locale={locale}
                  singleLine={true}
                />
              )}
              {auction.status === AuctionStatus.FINISHED && (
                <CustomText
                  type='h4'
                  className='text-center text-cinnabar'
                >
                  {auctionLang.ended}
                </CustomText>
              )}

              {/* ACTION BUTTONS ROW */}
              <View className='w-full flex-col items-center justify-center gap-2 md:w-2/3 md:flex-row md:gap-5 lg:w-1/3'>
                {auction.status === AuctionStatus.AVAILABLE && (
                  <FollowButton
                    key={follows}
                    className='w-2/3 enabled:hover:cursor-pointer disabled:opacity-50'
                    mode='primary'
                    size='large'
                    follows={follows}
                    followEndpoint={`/articles/${id}/follow`}
                    unfollowEndpoint={`/articles/${id}/unfollow`}
                    lang={locale}
                    isAvailable={article.sold}
                    extraDataIsLoaded={extraDataIsLoaded}
                  />
                )}

                {auction.status === AuctionStatus.LIVE && (
                  <CustomLink
                    mode='primary'
                    href={`/auctions/live/${auction.id}`}
                    className='w-2/3'
                  >
                    <Text className='text-base text-white'>
                      {auctionLang.watchButton}
                    </Text>
                  </CustomLink>
                )}

                {auction.status !== AuctionStatus.FINISHED && (
                  <ArticleBidsRecord
                    articleId={parseNumber(id)}
                    lang={locale}
                    initialPrice={article.startingPrice}
                    commissionValue={isCommissionReady ? commissionData : null}
                  />
                )}
              </View>
            </View>

            {/* SECTION: Image slider */}
            <View className='mt-10 w-full flex-row justify-center gap-10 px-5 md:px-0'>
              {/* <ArticleImagesSlider images={article.images} /> */}
              <ImagesCarousel images={article.images} />
            </View>

            {/* SECTION: Bidding */}
            <View className='mx-auto mt-10 w-full flex-col justify-around gap-5 md:w-4/5 md:flex-row'>
              <CurrentBidInfoArticlePage
                lang={locale}
                currentValue={articleBid.currentValue}
                estimatedValue={article.estimatedValue}
                reservePrice={article.reservePrice}
                commissionValue={isCommissionReady ? commissionData : null}
                texts={{
                  highestBid: articleLang.highestBid,
                  estimatedValue: articleLang.estimatedValue,
                  reservePrice: articleLang.hasReservePrice,
                  commission: articleLang.commission,
                  shipping: articleLang.shippingCosts,
                  price: articleLang.price,
                }}
              />
              {[
                AuctionStatus.PARTIALLY_AVAILABLE,
                AuctionStatus.PARTIALLY_AVAILABLE_CHANGES_MADE,
                AuctionStatus.AVAILABLE,
                AuctionStatus.LIVE,
              ].includes(auction.status) && (
                <View className='w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]'>
                  <SendBid
                    articleId={article.id}
                    articleServerState={{
                      currentValue: articleBid.currentValue,
                      highestBidder: '',
                      highestBidderImage: '',
                      available: articleBid.available,
                    }}
                    bidLang={bidsLang}
                    biddingAmounts={extraDataIsLoaded ? biddingAmounts : {}}
                    commissionPercentage={
                      isCommissionReady ? commissionData : null
                    }
                  />
                </View>
              )}
            </View>

            {/* SECTION: Specifications & Description & Observations */}
            <View className='mt-10 w-full flex-col gap-3 md:flex-row md:gap-5'>
              <ArticleSpecificationsSection
                article={article}
                articleLang={articleLang}
                lang={locale}
                articleCategory={article.category}
              />

              {!!article?.observations && (
                <View className='w-full rounded-md border border-neutral-300 p-4 md:flex-1'>
                  <>
                    <Text className='text-2xl font-bold'>
                      {articleLang.observations}
                    </Text>
                    {formatTextToParagraph(article.observations)}
                  </>
                </View>
              )}
              <View className='w-full rounded-md border border-neutral-300 p-4 md:flex-1'>
                <Text className='text-2xl font-bold'>
                  {articleLang.description}
                </Text>
                {formatTextToParagraph(article.description ?? '')}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* LIVE SUBSCRIPTIONS / MODALS / TRACKING */}
      {(auction.status === AuctionStatus.AVAILABLE ||
        auction.status === AuctionStatus.LIVE) && (
        <>
          <AuctionSubscriber
            auctionId={auction.id}
            refetch={refetchArticle}
          />
          <ArticleBidSubscriber
            articleId={article.id}
            onFirstBid={refetch}
          />
        </>
      )}

      {/* <NotifyModal lang={lang} /> */}
      {/* <TrackArticleView articleId={Number(id)} /> */}
    </HighestBidderProvider>
  );
}
