import { View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import {
  AUCTION_CATEGORIES_LABEL,
  AUCTION_MODE_LABEL,
  AUCTION_STATUS_LABEL,
  AuctionStatus,
} from '@/constants/auctions';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';
import { REQUEST_STATUS } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { Loading } from '@/components/ui/Loading';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';
import { ArticleFilters } from '@/components/articles/ArticleFilters';
import { ArticlesInfiniteScroll } from '@/components/articles/ArticlesInfiniteScroll';

export default function MyAuctionDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{
    id: string;
    brand?: string;
    price?: string;
  }>();
  const {
    data: liveAuction,
    status,
    errorMessage,
    refetch: refetchAuction,
  } = useGetLiveAuction({
    auctionId: id,
  });
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

  const statusColor =
    auction.status === AuctionStatus.NEED_CHANGES ||
    auction.status === AuctionStatus.WAITING_MIN_ARTICLES_AMOUNT
      ? 'text-[#ff0000]'
      : 'text-cinnabar';

  function renderAuctionHeader() {
    return (
      <View className='flex w-full flex-col'>
        <View className='flex w-full flex-col items-center justify-center gap-4'>
          <View className='mx-auto mt-5 h-[400px] w-full max-w-80 overflow-hidden rounded-xl'>
            <CustomImage
              src={auction.image}
              alt={auction.title}
              className='h-full w-full'
            />
          </View>
          <View className='flex w-full flex-col items-center gap-1 text-center'>
            <CustomText
              type='h4'
              className='text-center text-cinnabar'
            >
              {AUCTION_MODE_LABEL[locale][auctionMode]}
            </CustomText>

            <CustomText
              type='h1'
              className='text-center'
            >
              {auction.title}
            </CustomText>
            <AuctionDisplayDateTime
              singleLine={true}
              startDate={auction.startDate}
              locale={locale}
            />
            <CustomText
              type='h4'
              className={`text-center ${statusColor}`}
            >
              {
                AUCTION_STATUS_LABEL[
                  locale as keyof typeof AUCTION_STATUS_LABEL
                ][auction.status]
              }
            </CustomText>
            <CustomText
              type='body'
              className='text-center text-black'
            >
              {
                AUCTION_CATEGORIES_LABEL[
                  locale as keyof typeof AUCTION_CATEGORIES_LABEL
                ][auction.category]
              }
            </CustomText>
          </View>
        </View>
        <View className='mt-8'>
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
          articlesFollowed={[]}
          order={undefined}
          filtersKey={''}
        />
      </View>
      <AuctionSubscriber
        auctionId={auction.id}
        refetch={refetchAuction}
      />
    </>
  );
}
