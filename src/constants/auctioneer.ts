import { APP_USER_ROLES } from './user';

export const INDEX_OPTIONS = [
  {
    name: 'edit-store',
    icon: 'edit',
    labelKey: 'screens.auctioneer.editStore',
    href: '/(tabs)/auctioneer/edit',
    role: APP_USER_ROLES.AUCTIONEER,
  },
  {
    name: 'my-live-auctions',
    icon: 'video-camera',
    labelKey: 'screens.auctioneer.myAuctions',
    href: '/(tabs)/auctioneer/my-auctions',
    role: APP_USER_ROLES.AUCTIONEER,
  },
  {
    name: 'my-online-store',
    icon: 'shopping-bag',
    labelKey: 'screens.auctioneer.myOnlineStore',
    href: '/(tabs)/auctioneer/my-online-store',
    role: APP_USER_ROLES.AUCTIONEER,
  },
  {
    name: 'sold-articles',
    icon: 'dollar',
    labelKey: 'screens.auctioneer.soldArticles',
    href: '/(tabs)/auctioneer/sold-articles',
    role: APP_USER_ROLES.AUCTIONEER,
  },
  {
    name: 'payouts',
    icon: 'money',
    labelKey: 'screens.auctioneer.payouts',
    href: '/(tabs)/auctioneer/payouts',
    role: APP_USER_ROLES.AUCTIONEER,
  },
];
