import React from 'react';
import { View } from 'react-native';
import { Auction, Lang } from '@/types/types';
import { CustomLink } from '../ui/CustomLink';
import { AuctionDisplayDateTime } from './AuctionDisplayDateTime';
import { CustomText } from '../ui/CustomText';
import { FollowButton } from '../ui/FollowButton';
import { CustomImage } from '../ui/CustomImage';

type Props = {
  auction: Auction;
  locale: Lang;
  userFollows: boolean;
  actionAfterFollow?: () => void;
};

export function AuctionItem({
  auction,
  locale,
  userFollows,
  actionAfterFollow,
}: Props) {
  const id = auction.id;

  return (
    <View className='w-full gap-2'>
      <CustomLink
        className='flex w-full flex-row gap-5'
        href={`/(tabs)/auctions/${id}`}
        mode='empty'
      >
        <View className='aspect-square w-1/2 items-center overflow-hidden rounded-xl'>
          <CustomImage
            src={auction.image}
            alt={auction.title}
            accessibilityLabel={auction.title}
            className='h-full w-full'
            resizeMode='cover'
          />
        </View>

        <View className='w-1/2 flex-col items-start justify-between'>
          <View className='flex flex-col pr-2 pt-5'>
            <CustomText
              type='h4'
              className='text-center text-cinnabar'
            >
              {auction.title}
            </CustomText>

            <AuctionDisplayDateTime
              startDate={auction.startDate}
              locale={locale}
              singleLine={false}
            />
          </View>

          <FollowButton
            className='w-2/3 enabled:hover:cursor-pointer disabled:opacity-50'
            mode='primary'
            size='large'
            follows={userFollows}
            followEndpoint={`/auctions/${id}/follow`}
            unfollowEndpoint={`/auctions/${id}/unfollow`}
            lang={locale}
            extraDataIsLoaded={true}
            actionAfterFollow={actionAfterFollow}
          />
        </View>
      </CustomLink>
    </View>
  );
}
