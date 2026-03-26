import { NotificationEventType } from '@/types/types';

export const getNotificationRedirectUrl = ({
  event,
  metadata,
}: {
  event: NotificationEventType;
  metadata: Record<string, string | number> | null;
}) => {
  switch (event) {
    case NotificationEventType.ARTICLE_WON:
      return `/(tabs)/account/articles-won`;
    case NotificationEventType.OFFER_RECEIVED:
      return `/(tabs)/auctioneer/my-online-store/articles/${metadata?.id}`;
    case NotificationEventType.OFFER_ACCEPTED:
      return `/(tabs)/account/single-payment/?articleId=${metadata?.id}`;
    case NotificationEventType.OFFER_REJECTED:
      return `/(tabs)/account/offers-made`;
    case NotificationEventType.SHIPPING_UPDATED:
      return `/(tabs)/account/payment/${metadata?.id}`;
    case NotificationEventType.PAYMENT_APPROVED:
      return `/(tabs)/account/payment/${metadata?.id}`;
    case NotificationEventType.PAYMENT_RECEIVED:
      return `/(tabs)/auctioneer/sold-articles/${metadata?.id}`;
    default:
      return `/(tabs)/`;
  }
};
