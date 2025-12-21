import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import type { Auction, Lang } from '@/types/types';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { SimpleCountdown } from '../ui/SimpleCountdown';

export const AuctionsSliderItem = ({
  lang,
  auction,
  cardWidth,
}: {
  lang: Lang;
  auction: Auction;
  cardWidth: number;
}) => {
  const router = useRouter();
  const imageHeight = Math.round(cardWidth * 1.05);

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/auctions/${auction.id}`)}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={{ gap: 10 }}>
        {/* Image */}
        <View className='w-full overflow-hidden rounded-lg'>
          <CustomImage
            src={auction.image}
            alt={auction.title}
            resizeMode='cover'
            style={{ width: '100%', height: imageHeight }}
          />
        </View>

        {/* Content */}
        <View className='items-start'>
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
            singleLine
          />

          <CustomText
            type='h4'
            className='text-left'
            numberOfLines={2}
          >
            {auction.title}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};
