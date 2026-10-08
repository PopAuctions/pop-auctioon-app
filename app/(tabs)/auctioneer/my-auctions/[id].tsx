import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useLocalSearchParams } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { AuctionStatus } from '@/constants/auctions';
import { REQUEST_STATUS } from '@/constants';
import { CustomImage } from '@/components/ui/CustomImage';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { View } from '@/components/Themed';
import { MyAuctionActions } from '@/components/auctions/MyAuctionActions';
import { MyAuctionArticlesSection } from '@/components/articles/MyAuctionArticlesSection';
import { useGetMyAuction } from '@/hooks/pages/auction/useGetMyAuction';
import { useGetLiveAuction } from '@/hooks/pages/auction/useGetLiveAuction';

export default function MyAuctionDetailScreen() {
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const {
    data: auctionData,
    status,
    errorMessage,
    refetch,
  } = useGetMyAuction({
    auctionId: id,
  });

  const { data: liveAuctionData } = useGetLiveAuction({
    auctionId: id,
    validateIsLive: false,
  });
  const auctionLang = t('screens.myAuction');
  const auctionModeLabels = t('displayLabels.auctionMode', { locale });
  const auctionStatusLabels = t('displayLabels.auctionStatus', { locale });
  const auctionCategoryLabels = t('displayLabels.auctionCategory', { locale });
  const liveAuction = liveAuctionData?.auction;
  const auction = auctionData?.auction;

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !auction) {
    return (
      <CustomError
        customMessage={errorMessage?.[locale]}
        refreshRoute={`/(tabs)/auctioneer/my-auctions/${id}`}
      />
    );
  }

  const auctionMode = auction.mode;

  const statusColor =
    auction.status === AuctionStatus.NEED_CHANGES ||
    auction.status === AuctionStatus.WAITING_MIN_ARTICLES_AMOUNT
      ? 'text-[#ff0000]'
      : 'text-cinnabar';

  const header = (
    <View className='flex w-full flex-col items-center justify-center gap-4'>
      <View className='mx-auto mt-5 h-[300px] w-full max-w-80 overflow-hidden rounded-xl'>
        <CustomImage
          src={auction.image ?? ''}
          alt={auction.title}
          className='h-full w-full'
        />
      </View>
      <View className='flex w-full flex-col items-center gap-1 text-center'>
        <CustomText
          type='h4'
          className='text-center text-cinnabar'
        >
          {auctionModeLabels[auctionMode]}
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
          {auctionStatusLabels[auction.status]}
        </CustomText>
        <CustomText
          type='body'
          className='text-center text-black'
        >
          {auctionCategoryLabels[auction.category]}
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
  );

  return (
    <View className='flex-1 bg-white p-4'>
      <MyAuctionArticlesSection
        auctionId={id}
        auctionStatus={auction.status as AuctionStatus}
        articlesOrder={liveAuction?.articlesOrder ?? []}
        ListHeaderComponent={header}
      />
    </View>
  );
}
