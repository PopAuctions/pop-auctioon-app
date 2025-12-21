import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import type { Auction, Lang } from '@/types/types';
import { SimpleCountdown } from '../ui/SimpleCountdown';
import { AuctionDisplayDateTime } from './AuctionDisplayDateTime';

export const AuctionsSliderItem = ({
  lang,
  auction,
}: {
  lang: Lang;
  auction: Auction;
}) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/auctions/${auction.id}`)}
      className='w-full'
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View
        className='flex w-full max-w-[350px] flex-col'
        style={{ gap: 12 }}
      >
        {/* Image */}
        <View className='w-full overflow-hidden rounded-lg'>
          <CustomImage
            src={auction.image}
            alt={auction.title}
            className='aspect-[3/4] w-full'
            resizeMode='cover'
          />
        </View>

        {/* Content */}
        <View className='flex-col items-start'>
          <SimpleCountdown
            dateString={auction.startDate}
            locale={lang}
            texts={{
              completed: {
                en: 'Auction already started',
                es: 'La subasta ya comenzó',
              },
            }}
          />

          <AuctionDisplayDateTime
            startDate={auction.startDate}
            locale={lang}
            displayTime={false}
            singleLine={true}
          />

          <CustomText
            type='h4'
            className='text-left'
          >
            {auction.title}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};
