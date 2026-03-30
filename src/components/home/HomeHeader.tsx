import { Pressable, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { CustomLink } from '@/components/ui/CustomLink';

type HomeHeaderProps = {
  unreadCount?: number;
  isAuctioneer: boolean;
  texts: {
    createAuction: string;
  };
};

export function HomeHeader({
  unreadCount = 0,
  isAuctioneer = false,
  texts,
}: HomeHeaderProps) {
  const { navigateWithAuth } = useAuthNavigation();

  const hasUnread = unreadCount > 0;
  const displayedCount = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <View className='w-full flex-row items-center border-b border-gray px-4 py-1'>
      <View className='w-full flex-row items-center justify-between gap-3'>
        <Pressable
          onPress={() =>
            navigateWithAuth('/(tabs)/account/offers-made?fromTab=true')
          }
          className='h-11 w-11 items-center justify-center rounded-full'
          accessibilityRole='button'
          accessibilityLabel='Offers made'
        >
          <FontAwesomeIcon
            variant='light'
            name='tag'
            size={22}
            color='#111827'
          />
        </Pressable>

        <View className='flex flex-row gap-2'>
          {isAuctioneer && (
            <CustomLink
              mode='primary'
              size='small'
              href='/(tabs)/auctioneer/my-auctions/new'
              textClassName='text-sm'
              className='p-2'
            >
              {texts.createAuction}
            </CustomLink>
          )}
          <Pressable
            onPress={() =>
              navigateWithAuth('/(tabs)/account/notifications?fromTab=true')
            }
            className='relative h-11 w-11 items-center justify-center rounded-full'
            accessibilityRole='button'
            accessibilityLabel='Notifications'
          >
            <FontAwesomeIcon
              name='bell'
              size={22}
              color='#111827'
            />

            {hasUnread ? (
              <View className='absolute right-1 top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cinnabar px-1'>
                <CustomText
                  type='bodysmall'
                  className='text-[10px] font-bold text-white'
                >
                  {displayedCount}
                </CustomText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
