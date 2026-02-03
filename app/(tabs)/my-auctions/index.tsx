import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { useGetMyAuctions } from '@/hooks/pages/my-auctions/useGetMyAuctions';
import { REQUEST_STATUS } from '@/constants';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { useHideWhileStackBuilds } from '@/hooks/useHideWhileStackBuilds';

export default function MyAuctionsScreen() {
  const { locale, t } = useTranslation();
  const { data: auctions, status, errorMessage, refetch } = useGetMyAuctions();
  const [refreshing, setRefreshing] = useState(false);
  const myAuctions = t('screens.myAuctions');
  const shouldHide = useHideWhileStackBuilds();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (shouldHide) {
    return <View className='flex-1 bg-white' />;
  }

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || auctions === null) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/my-auctions'
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
        {/* Title */}
        <CustomText
          type='h1'
          className='my-4 text-center'
        >
          {myAuctions.title}
        </CustomText>

        {/* Payment cards list */}
        <View className='mt-4 flex flex-col items-center gap-4'>
          {/* Top actions */}
          <View className='flex flex-row gap-3'>
            <CustomLink
              href='/my-auctions/new'
              mode='primary'
            >
              {myAuctions.newAuction}
            </CustomLink>

            <CustomLink
              href='/my-auctions/old'
              mode='secondary'
            >
              {myAuctions.oldAuctions}
            </CustomLink>
          </View>

          {/* Auctions list */}
          <View className='mt-6 w-full'>
            <View className='flex w-full flex-col gap-5'>
              {auctions.map((auction) => (
                <View
                  key={auction.id}
                  className='w-full'
                >
                  <CustomLink
                    href={`/my-auctions/${auction.id}`}
                    className='flex w-full flex-row gap-5 md:gap-8'
                  >
                    {/* Image */}
                    <View className='aspect-[3/4] w-1/2 overflow-hidden rounded-lg md:w-2/5'>
                      <CustomImage
                        src={auction.image}
                        alt={auction.title}
                        className='h-full w-full'
                        resizeMode='cover'
                      />
                    </View>

                    {/* Info */}
                    <View className='w-1/2 flex-col items-start justify-center md:w-3/5'>
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
