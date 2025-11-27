import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { MyAuctionArticles } from '@/components/articles/MyAuctionArticles';
import { MyAuctionArticlesFilters } from '@/components/articles/MyAuctionArticlesFilters';
import { CustomError } from '@/components/ui/CustomError';
import { View } from '@/components/Themed';
import { CustomLink } from '@/components/ui/CustomLink';
import { MyAuctionActions } from '@/components/auctions/MyAuctionActions';

export default function MyAuctionDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const {
    data: liveAuction,
    status,
    errorMessage,
    refetch,
  } = useGetLiveAuction({
    auctionId: id,
  });
  const auctionLang = t('screens.myAuction');

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !liveAuction) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/payments-history'
      />
    );
  }

  const { Auction: auction } = liveAuction;
  const auctionMode = auction.mode;

  const statusColor =
    auction.status === AuctionStatus.NEED_CHANGES ||
    auction.status === AuctionStatus.WAITING_MIN_ARTICLES_AMOUNT
      ? 'text-[#ff0000]'
      : 'text-cinnabar';

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1 px-5'>
        <View className='flex w-full flex-col'>
          <View className='flex w-full flex-col items-center justify-center gap-4'>
            <View className='mx-auto mt-5 h-[300px] w-full max-w-80 overflow-hidden rounded-xl'>
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
            <MyAuctionActions
              locale={locale}
              auctionId={id}
              auctionStatus={auction.status as AuctionStatus}
              myAuction={auctionLang}
              refetch={refetch}
            />
          </View>
          <View className='mt-8'>
            <CustomText
              type='subtitle'
              className='text-center text-3xl text-cinnabar'
            >
              {auctionLang.articles}
            </CustomText>
          </View>
          <View className='flex flex-row items-end justify-between'>
            <MyAuctionArticlesFilters locale={locale} />
            <View>
              <CustomLink
                mode='primary'
                href={`(tabs)/my-auctions/${id}/new-article`}
              >
                {auctionLang.newArticle}
              </CustomLink>
            </View>
          </View>
        </View>
        <View>
          <MyAuctionArticles
            lang={locale}
            auctionStatus={auction.status as AuctionStatus}
            auctionId={id}
            texts={{
              remove: auctionLang.remove,
            }}
            order={liveAuction?.articlesOrder ?? []}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
