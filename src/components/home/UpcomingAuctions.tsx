import React from 'react';
import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import type { Auction, Lang } from '@/types/types';
import { AuctionsSlider } from '../auctions/AuctionsSlider';

export const UpcomingAuctionsSection = ({
  locale,
  texts: { title, noAuction },
  auctions,
}: {
  locale: Lang;
  texts: { title: string; noAuction: string };
  auctions: Auction[];
}) => {
  return (
    <View className='my-5 w-full'>
      <CustomText
        type='h2'
        className='text-center'
      >
        {title}
      </CustomText>

      <View className='my-5 w-full items-center justify-center'>
        {auctions.length > 0 ? (
          <AuctionsSlider
            auctions={auctions}
            locale={locale}
          />
        ) : (
          <CustomText
            type='h2'
            className='text-center text-cinnabar'
          >
            {noAuction}
          </CustomText>
        )}
      </View>
    </View>
  );
};
