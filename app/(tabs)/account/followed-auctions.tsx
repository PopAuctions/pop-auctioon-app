import { ScrollView, View } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { useGetFollowedAuctions } from '@/hooks/pages/auction/useGetFollowedAuction';
import { AuctionItem } from '@/components/auctions/AuctionItem';

export default function FollowedAuctionsScreen() {
  const { t, locale } = useTranslation();
  const {
    data: auctions,
    status,
    errorMessage,
    refetch,
  } = useGetFollowedAuctions();

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || auctions === null) {
    return (
      <View className='flex-1 items-center justify-center'>
        <CustomText type='h2'>{errorMessage?.[locale]}</CustomText>
      </View>
    );
  }

  if (auctions.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {t('screens.auction.noFollowedAuctions')}
        </CustomText>
      </View>
    );
  }

  return (
    <ScrollView className='w-full flex-1 p-4'>
      <View className='flex flex-col gap-4'>
        {auctions.map((item) => (
          <AuctionItem
            key={item.id}
            auction={item.Auction}
            locale={locale}
            userFollows={true}
            actionAfterFollow={refetch}
          />
        ))}
      </View>
    </ScrollView>
  );
}
