import { View, ScrollView } from 'react-native';
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
// import { ShareButton } from '@/components/ui/ShareButton';

export default function AuctionDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: liveAuction,
    status,
    errorMessage,
  } = useGetLiveAuction({
    auctionId: id,
  });
  const auctionLang = t('screens.auction');

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>loading</CustomText>
      </View>
    );
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

  return (
    <View className='bg-gray-50 flex-1'>
      <ScrollView className='flex-1 bg-white'>
        <View className='mt-5 flex w-full flex-col lg:mt-0 lg:flex-row lg:justify-center'>
          <View className='mt-0 flex w-full flex-col items-center justify-center gap-2 space-y-3 lg:w-1/2 lg:space-y-6'>
            <View className='flex flex-col items-center gap-2 text-center'>
              <View className='flex'>
                <CustomText
                  type='h4'
                  className='text-base text-cinnabar'
                >
                  {AUCTION_MODE_LABEL[locale][auctionMode]}
                </CustomText>

                {/* {auctionMode === AuctionMode.AUTOMATIC && (
                  <View className='ml-2 flex items-center hover:cursor-pointer'>
                    <HowAutoLiveWorksModal lang={locale}>
                      <InfoIcon className='h-4 w-4 text-cinnabar' />
                    </HowAutoLiveWorksModal>
                  </View>
                )} */}
              </View>
              <CustomText type='h1'>{auction.title}</CustomText>
              {auction.status !== AuctionStatus.LIVE && (
                // <AuctionDisplayDateTime
                //   singleLine={true}
                //   startDate={auction.startDate}
                //   lang={locale}
                // />
                <CustomText
                  type='h4'
                  className='text-base text-cinnabar'
                >
                  date-time display
                </CustomText>
              )}
            </View>
            <View className='flex flex-col md:flex-row'>
              {(auction.status === AuctionStatus.AVAILABLE ||
                auction.status === AuctionStatus.PARTIALLY_AVAILABLE ||
                auction.status ===
                  AuctionStatus.PARTIALLY_AVAILABLE_CHANGES_MADE) && (
                // <CountdownComponent
                //   dateString={auction.startDate}
                //   id={id}
                //   lang={locale}
                //   auctionLang={auctionLang}
                //   auctionMode={auctionMode}
                //   auctionView={true}
                //   minutesBefore={MINUTES_BEFORE_ENTERING}
                // />
                <CustomText
                  type='h4'
                  className='text-base text-cinnabar'
                >
                  Countdown
                </CustomText>
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
              <View className='flex w-4/5 justify-center gap-5 md:w-1/2 lg:w-full'>
                {auction.status === AuctionStatus.LIVE ? (
                  <CustomLink
                    className='w-full lg:w-fit'
                    mode='primary'
                    href={`/auction/${id}${LIVE_URL[auctionMode]}`}
                  >
                    {auctionLang.watchButton}
                  </CustomLink>
                ) : (
                  <CustomText
                    type='h4'
                    className='text-base text-cinnabar'
                  >
                    Follow button
                  </CustomText>
                  // <FollowButton
                  //   className='w-full lg:w-fit'
                  //   mode='primary'
                  //   follows={followsAuction.follows}
                  //   id={id}
                  //   followFunction={followAuction}
                  //   unfollowFunction={unfollowAuction}
                  //   lang={locale}
                  //   isAvailable={!isAuctionAvailable}
                  // >
                  //   {followsAuction.follows
                  //     ? auctionLang.unfollow
                  //     : auctionLang.follow}
                  // </FollowButton>
                )}
                {/* <ShareButton
                  className='w-full lg:w-fit'
                  mode='secondary'
                >
                  {auctionLang.share}
                </ShareButton> */}
                <CustomText
                  type='h4'
                  className='text-base text-cinnabar'
                >
                  Share button
                </CustomText>
              </View>
            )}
            {/* <View className='flex max-w-96 justify-center text-center'>
                <CustomText
                  type='body'
                  className='text-sm text-cinnabar'
                >
                  {auctionLang.specialMessage}
                </CustomText>
              </View> */}
          </View>
          <View className='mx-auto mt-10 aspect-[3/4] w-full max-w-80 overflow-hidden rounded-lg'>
            <CustomImage
              src={auction.image}
              alt={auction.title}
              className='h-2/3 w-full'
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
