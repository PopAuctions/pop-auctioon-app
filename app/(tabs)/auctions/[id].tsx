import { View, ScrollView, Pressable } from 'react-native';
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
import { HowAutoLiveWorksModal } from '@/components/modal/how-auto-live-works';
import { AuctionMode } from '@/types/types';
import { ShareButton } from '@/components/ui/ShareButton';
import { AuctionDisplayDateTime } from '@/components/auctions/auction-display-date-time';
import { CountdownComponent } from '@/components/ui/countdown-component';
import { MINUTES_BEFORE_ENTERING } from '@/constants/autoLiveAuction';

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
        <View className='mt-5 flex w-full flex-col'>
          <View className='mt-0 flex w-full flex-col items-center justify-center gap-4'>
            <View className='flex w-full flex-col items-center gap-3 text-center'>
              <View className='flex'>
                {auctionMode === AuctionMode.AUTOMATIC ? (
                  <HowAutoLiveWorksModal
                    locale={locale}
                    trigger={(open) => (
                      <Pressable onPress={open}>
                        <CustomText
                          type='h4'
                          className='text-cinnabar underline'
                        >
                          {AUCTION_MODE_LABEL[locale][auctionMode]}
                        </CustomText>
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
                <CountdownComponent
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
                    // WIP: fix URL
                    href={`/auction/${id}${LIVE_URL[auctionMode]}`}
                  >
                    {auctionLang.watchButton}
                  </CustomLink>
                ) : (
                  <ShareButton
                    className='w-1/2'
                    mode='primary'
                  >
                    {auctionLang.follow}
                  </ShareButton>
                  // <FollowButton
                  //   className='w-1/2'
                  //   mode='primary'
                  //   follows={followsAuction.follows}
                  //   id={id}
                  //   followFunction={followAuction}
                  //   unfollowFunction={unfollowAuction}
                  //   locale={locale}
                  //   isAvailable={!isAuctionAvailable}
                  // >
                  //   {followsAuction.follows
                  //     ? auctionLang.unfollow
                  //     : auctionLang.follow}
                  // </FollowButton>
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
          <View className='rounded- mx-auto mt-10 aspect-[3/4] w-full max-w-80 overflow-hidden'>
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
