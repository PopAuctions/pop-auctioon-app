import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useGetMyOldAuctions } from '@/hooks/pages/my-auctions/useGetMyOldAuctions';
import { Pagination } from '@/components/ui/Pagination';

export default function MyOldAuctionsScreen() {
  const { locale, t } = useTranslation();
  const {
    data: auctions,
    status,
    errorMessage,
    refetch,
    page,
    setPage,
    totalPages,
  } = useGetMyOldAuctions();
  const [refreshing, setRefreshing] = useState(false);
  const myAuctions = t('screens.myAuctions');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || auctions === null) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/auctioneer/my-auctions/old'
      />
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-6 py-6'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Payment cards list */}
        <View className='mt-4 flex flex-col items-center gap-4'>
          <View className='flex w-full flex-col gap-5'>
            {auctions.map((auction) => (
              <View
                key={auction.id}
                className='w-full'
              >
                <CustomLink
                  href={`/(tabs)/auctioneer/my-auctions/${auction.id}`}
                  className='flex w-full flex-row gap-5'
                >
                  {/* Image */}
                  <View className='aspect-[3/4] w-full max-w-40 overflow-hidden rounded-lg'>
                    <CustomImage
                      src={auction.image}
                      alt={auction.title}
                      className='h-full w-full'
                      resizeMode='cover'
                    />
                  </View>

                  {/* Info */}
                  <View className='flex flex-1 flex-col items-start justify-center'>
                    <AuctionDisplayDateTime
                      locale={locale}
                      startDate={auction.startDate}
                      singleLine={true}
                      displayTime={false}
                    />
                    <CustomText
                      type='h4'
                      className='text-start'
                    >
                      {auction.title}
                    </CustomText>
                  </View>
                </CustomLink>
              </View>
            ))}
          </View>

          {auctions.length === 0 && (
            <CustomText
              type='h2'
              className='mt-6 text-center text-cinnabar'
            >
              {myAuctions.noAuctionsFound}
            </CustomText>
          )}

          {auctions.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
