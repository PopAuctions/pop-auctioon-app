import { AuctionStatus } from '@/constants/auctions';
import { Translations } from '@/i18n';
import { View } from 'react-native';
import { ConfirmModal } from '../modal/ConfirmModal';
import { Lang, LangMap } from '@/types/types';
// import { CustomLink } from '../ui/CustomLink';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export const MyAuctionActions = ({
  auctionId,
  auctionStatus,
  myAuction,
  locale,
  refetch,
}: {
  auctionId: string;
  auctionStatus: AuctionStatus;
  myAuction: Translations['es']['screens']['myAuction'];
  locale: Lang;
  refetch: () => void;
}) => {
  const { t } = useTranslation();
  const modalTexts = t('components.modals.auctionReview', { locale });
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const requestReviewFunction = async () => {
    try {
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.REQUEST_REVIEW(auctionId),
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: response.data });
      refetch();
    } catch (e: any) {
      sentryErrorReport(e?.message, `REQUEST_REVIEW`);
    }
  };

  return (
    <View className='flex flex-row gap-4'>
      {/* {(auctionStatus === AuctionStatus.NOT_AVAILABLE ||
        auctionStatus === AuctionStatus.NEED_CHANGES ||
        auctionStatus === AuctionStatus.CHANGES_MADE) && (
        <CustomLink
          href={`/(tabs)/auctioneer/my-auctions/${auctionId}/edit`}
          size='small'
          className='w-1/2'
          mode='primary'
        >
          {myAuction.edit}
        </CustomLink>
      )} */}
      {(auctionStatus === AuctionStatus.NOT_AVAILABLE ||
        auctionStatus === AuctionStatus.NEED_CHANGES ||
        auctionStatus === AuctionStatus.CHANGES_MADE ||
        auctionStatus === AuctionStatus.PARTIALLY_AVAILABLE ||
        auctionStatus === AuctionStatus.WAITING_MIN_ARTICLES_AMOUNT) && (
        <ConfirmModal
          mode='primary'
          title={modalTexts.title}
          description={modalTexts.description}
          onConfirm={requestReviewFunction}
        >
          {auctionStatus === AuctionStatus.PARTIALLY_AVAILABLE
            ? myAuction.requestUpdate
            : myAuction.publish}
        </ConfirmModal>
      )}
    </View>
  );
};
