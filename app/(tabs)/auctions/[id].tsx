import { View, Pressable } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import {
  AUCTION_MODE_LABEL,
  AuctionStatus,
  LIVE_URL,
} from '@/constants/auctions';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';
import { REQUEST_STATUS } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomLink } from '@/components/ui/CustomLink';
import { HowAutoLiveWorksModal } from '@/components/modal/HowAutoLiveWorks';
import { AuctionMode } from '@/types/types';
import { ShareButton } from '@/components/ui/ShareButton';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { MINUTES_BEFORE_ENTERING } from '@/constants/autoLiveAuction';
import { AuctionCountdownComponent } from '@/components/auctions/AuctionCountdownComponent';
import { ArticlesInfiniteScroll } from '@/components/articles/ArticlesInfiniteScroll';
import { Loading } from '@/components/ui/Loading';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { FollowButton } from '@/components/ui/FollowButton';
import { useGetUserFollowsAuction } from '@/hooks/pages/auction/useGetUserFollowsAuction';
import { useGetArticlesUserFollows } from '@/hooks/pages/article/useGetArticlesUserFollows';
import { ArticleFilters } from '@/components/articles/ArticleFilters';

export default function AuctionDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: liveAuction,
    status,
    errorMessage,
    refetch: refetchAuction,
  } = useGetLiveAuction({
    auctionId: id,
  });
  const { data: userFollows, status: userFollowsStatus } =
    useGetUserFollowsAuction({
      auctionId: id,
    });
  const { data: userArticlesFollowed } = useGetArticlesUserFollows();
  const auctionLang = t('screens.auction');

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !liveAuction) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }

  const { Auction: auction } = liveAuction;
  const auctionMode = auction.mode;

  const isAuctionAvailable =
    auction.status === AuctionStatus.AVAILABLE ||
    auction.status === AuctionStatus.PARTIALLY_AVAILABLE ||
    auction.status === AuctionStatus.PARTIALLY_AVAILABLE_CHANGES_MADE;
  function renderAuctionHeader() {
    return (
      <View className='mt-5 flex w-full flex-col'>
        <View className='mt-0 flex w-full flex-col items-center justify-center gap-4'>
          <View className='flex w-full flex-col items-center gap-3 text-center'>
            <View className='flex'>
              {auctionMode === AuctionMode.AUTOMATIC ? (
                <HowAutoLiveWorksModal
                  locale={locale}
                  trigger={(open) => (
                    <Pressable
                      onPress={open}
                      className='flex flex-row items-center justify-center gap-2'
                    >
                      <CustomText
                        type='h4'
                        className='text-cinnabar underline'
                      >
                        {AUCTION_MODE_LABEL[locale][auctionMode]}
                      </CustomText>
                      <FontAwesomeIcon
                        name='info-circle'
                        size={16}
                        color='cinnabar'
                      />
                    </Pressable>
                  )}
                />
              ) : (
                <CustomText
                  type='h4'
                  className='text-base text-cinnabar'
                >
                  {AUCTION_MODE_LABEL[locale][auctionMode]}
                </CustomText>
              )}
            </View>

            <CustomText
              type='h1'
              className='text-center'
            >
              {auction.title}
            </CustomText>

            {auction.status !== AuctionStatus.LIVE && (
              <AuctionDisplayDateTime
                singleLine={true}
                startDate={auction.startDate}
                locale={locale}
              />
            )}
          </View>

          <View className='flex flex-col md:flex-row'>
            {(auction.status === AuctionStatus.AVAILABLE ||
              auction.status === AuctionStatus.PARTIALLY_AVAILABLE ||
              auction.status ===
                AuctionStatus.PARTIALLY_AVAILABLE_CHANGES_MADE) && (
              <AuctionCountdownComponent
                dateString={auction.startDate}
                id={id}
                locale={locale}
                auctionLang={auctionLang}
                auctionMode={auctionMode}
                auctionView={true}
                minutesBefore={MINUTES_BEFORE_ENTERING}
              />
            )}

            {auction.status === AuctionStatus.LIVE && (
              <View className='flex flex-col items-center gap-2'>
                <CustomText
                  type='h4'
                  className='text-cinnabar'
                >
                  {auctionLang.start}
                </CustomText>
              </View>
            )}

            {auction.status === AuctionStatus.FINISHED && (
              <View className='flex flex-col items-center gap-2'>
                <CustomText
                  type='h3'
                  className='text-cinnabar'
                >
                  {auctionLang.finished}
                </CustomText>
              </View>
            )}
          </View>

          {auction.status !== AuctionStatus.FINISHED && (
            <View className='flex w-4/5 flex-row justify-center gap-5 md:w-1/2'>
              {auction.status === AuctionStatus.LIVE ? (
                <CustomLink
                  className='w-1/2'
                  mode='primary'
                  href={`/auction/${id}${LIVE_URL[auctionMode]}`}
                >
                  {auctionLang.watchButton}
                </CustomLink>
              ) : (
                <FollowButton
                  className='w-2/3 enabled:hover:cursor-pointer disabled:opacity-50'
                  mode='primary'
                  size='large'
                  follows={userFollows}
                  followEndpoint={`/auctions/${id}/follow`}
                  unfollowEndpoint={`/auctions/${id}/unfollow`}
                  lang={locale}
                  isAvailable={!isAuctionAvailable}
                  extraDataIsLoaded={
                    userFollowsStatus === REQUEST_STATUS.success
                  }
                />
              )}

              <ShareButton
                className='w-1/2'
                mode='secondary'
              >
                {auctionLang.share}
              </ShareButton>
            </View>
          )}
        </View>

        <View className='mx-auto mt-5 h-[400px] w-full max-w-80 overflow-hidden rounded-xl'>
          <CustomImage
            src={auction.image}
            alt={auction.title}
            className='h-full w-full'
          />
        </View>

        <View className='mt-8 px-5'>
          <CustomText
            type='subtitle'
            className='text-center text-3xl text-cinnabar'
          >
            {auctionLang.articles}
          </CustomText>
          <View className='my-2'>
            <ArticleFilters locale={locale} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className='flex-1'>
        <ArticlesInfiniteScroll
          lang={locale}
          auctionId={id}
          texts={{
            currentBid: auctionLang.currentBid,
          }}
          ListHeaderComponent={renderAuctionHeader()}
          articlesFollowed={userArticlesFollowed || []}
          // When there is a filter, the order is not applied
          order={liveAuction?.articlesOrder}
        />
      </View>
      <AuctionSubscriber
        auctionId={auction.id}
        refetch={refetchAuction}
      />
    </>
  );
}
