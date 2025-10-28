import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetArticle } from '@/hooks/pages/article/useGetArticle';
import { ARTICLE_BRANDS_LABELS, REQUEST_STATUS } from '@/constants';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Loading } from '@/components/ui/Loading';
import { AuctionStatus } from '@/constants/auctions';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomLink } from '@/components/ui/CustomLink';
import { ImagesCarousel } from '@/components/ui/ImagesCarousel';
import { CurrentBidInfoArticlePage } from '@/components/articles/CurrentBidInfoArticlePage';
import { ArticleSpecificationsSection } from '@/components/articles/ArticleSpecificationsSection';
import { formatTextToParagraph } from '@/utils/formatTextToParagraph';
import { SendBid } from '@/components/bids/SendBid';
import { MAX_BID_OFFSET } from '@/constants/bid';

export default function ArticleDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auctionLang = t('screens.auction');
  const articleLang = t('screens.article');
  const bidsLang = t('components.bid');
  const {
    data: article,
    status,
    errorMessage,
  } = useGetArticle({
    articleId: Number(id),
    validateAuctionStatus: true,
    publishedArticle: true,
    getAuctionData: true,
  });

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    if (status === 'loading') {
      return <Loading locale={locale} />;
    }
  }

  if (status === REQUEST_STATUS.error || !article || !article?.images) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }
  const auction = article.Auction;
  const previousArticleId = false;
  const nextArticleId = false;

  return (
    <>
      <ScrollView className='w-full'>
        <View className='mx-auto w-full max-w-[672px] px-5 md:max-w-[896px]'>
          <View className='mt-2 w-full flex-row justify-end'>
            <View className='flex flex-row gap-2'>
              {!previousArticleId ? (
                <View className='h-10 w-10 items-center justify-center opacity-50'>
                  <FontAwesomeIcon
                    name='arrow-left'
                    size={20}
                    color='#4d4d4d'
                  />
                </View>
              ) : (
                <>
                  {/* <CustomLink
                    lang={lang}
                    mode="plainText"
                    href={`/auction/article/${previousArticleId}`}
                    className="hover:scale-110"
                  >
                    <ArrowLeftIcon className="h-10 w-10" />
                  </CustomLink> */}
                  <TouchableOpacity
                    onPress={() => {
                      // navigate to /auction/article/${previousArticleId}
                    }}
                    className='h-10 w-10 items-center justify-center'
                  >
                    <FontAwesomeIcon
                      name='arrow-left'
                      size={20}
                      color='#4d4d4d'
                    />
                  </TouchableOpacity>
                </>
              )}

              {!nextArticleId ? (
                // <ArrowRightIcon className="h-10 w-10 opacity-50" />
                <View className='h-10 w-10 items-center justify-center opacity-50'>
                  <FontAwesomeIcon
                    name='arrow-right'
                    size={20}
                    color='#4d4d4d'
                  />
                </View>
              ) : (
                <>
                  {/* <CustomLink
                    lang={lang}
                    mode="plainText"
                    href={`/auction/article/${nextArticleId}`}
                    className="hover:scale-110"
                  >
                    <ArrowRightIcon className="h-10 w-10" />
                  </CustomLink> */}
                  <TouchableOpacity
                    onPress={() => {
                      // navigate to /auction/article/${nextArticleId}
                    }}
                    className='h-10 w-10 items-center justify-center'
                  >
                    <FontAwesomeIcon
                      name='arrow-right'
                      size={20}
                      color='#4d4d4d'
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* MAIN */}
          <View className='w-full flex-col items-center pb-16'>
            {/* SECTION: Header */}
            <View className='mt-10 w-full flex-col items-center justify-center gap-2'>
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
                  <>
                    {/* <FollowButton
                      className="w-2/3 enabled:hover:cursor-pointer disabled:opacity-50"
                      mode="primary"
                      size="small"
                      follows={followsArticle.follows}
                      id={id}
                      followFunction={followArticle}
                      unfollowFunction={unfollowArticle}
                      lang={lang}
                      isAvailable={article.sold}
                    >
                      {followsArticle.follows
                        ? articleLang.unfollow
                        : articleLang.follow}
                    </FollowButton> */}
                    {/* WIP: Follow button */}
                    <Button
                      className='w-2/3'
                      mode='primary'
                    >
                      {auctionLang.follow}
                    </Button>
                  </>
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
                  // Open modal with bid history
                  <Button
                    className='w-2/3'
                    mode='secondary'
                  >
                    {articleLang.bidsHistory}
                  </Button>
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
                currentValue={article.ArticleBid.currentValue}
                estimatedValue={article.estimatedValue}
                reservePrice={article.reservePrice}
                commissionValue={LOW_COMMISSION_AMOUNT}
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
                    bidLang={bidsLang}
                    lang={locale}
                    biddingAmounts={{
                      maxAmountWithoutToast: 470,
                      minBid: 10,
                      tenPercent: 10,
                      twentyFivePercent: 210,
                      fiftyPercent: 320,
                    }}
                    maxBidOffset={MAX_BID_OFFSET}
                    commissionPercentage={LOW_COMMISSION_AMOUNT}
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
          {/* <ArticleBidUserSubscribe
            channel={`article_${id}`}
            table="ArticleBid"
            filter={`articleId=eq.${id}`}
          /> */}
        </>
      )}

      {auction.status === AuctionStatus.AVAILABLE && (
        <>
          {/* <AuctionStatusSubscribe
            channel={`auction_${auction.id}`}
            table={'Auction'}
            filter={`id=eq.${auction.id}`}
            compareTo={AuctionStatus.LIVE}
          /> */}
        </>
      )}

      {/* <NotifyModal lang={lang} /> */}
      {/* <TrackArticleView articleId={Number(id)} /> */}
    </>
  );
}
