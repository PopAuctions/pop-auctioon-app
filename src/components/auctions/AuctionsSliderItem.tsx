import React from 'react';
import { View } from 'react-native';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import type { Auction, Lang } from '@/types/types';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';
import { SimpleCountdown } from '../ui/SimpleCountdown';
import { AuctionStatus } from '@/constants/auctions';
import { t } from '@/i18n';

export const AuctionsSliderItem = ({
  lang,
  auction,
  cardWidth,
}: {
  lang: Lang;
  auction: Auction;
  cardWidth: number;
}) => {
  const imageHeight = Math.round(cardWidth * 1.05);
  const countdownTexts = t('components.simpleCountdown', { locale: lang });

  return (
    <CustomLink href={`/(tabs)/auctions/${auction.id}`}>
      <View style={{ gap: 10 }}>
        {/* Image */}
        <View className='w-full overflow-hidden rounded-lg'>
          <CustomImage
            src={auction.image}
            alt={auction.title}
            resizeMode='contain'
            style={{ width: '100%', height: imageHeight }}
          />
        </View>

        {/* Content */}
        <View className='items-start'>
          <SimpleCountdown
            dateString={auction.startDate}
            auctionStatus={auction.status as AuctionStatus}
            texts={{
              completed: countdownTexts.completed,
              startSoon: countdownTexts.auctionStartSoon,
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
    </CustomLink>
  );
};
