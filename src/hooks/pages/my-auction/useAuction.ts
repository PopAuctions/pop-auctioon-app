import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { LangMap } from '@/types/types';
import type { MessageKey } from '@/i18n';
import { parseLocalDateTime } from '@/utils/getMinDateToStartAuction';
import { AuctionFormValues } from '@/utils/schemas/auctionSchemas';

const AUCTION_CREATION_ERROR =
  'errors.auction.creationFailed' as const satisfies MessageKey;
const AUCTION_UPDATE_ERROR =
  'errors.auction.updateFailed' as const satisfies MessageKey;

interface FunctionResponse {
  status: 'success' | 'error';
}

interface CreateAuctionArgs {
  values: AuctionFormValues;
  imageFile: string;
}

interface EditAuctionArgs {
  values: AuctionFormValues;
  imageFile: string;
  removedImages: string[];
  auctionId: string;
}

export const useAuction = (): {
  createAuction: (args: CreateAuctionArgs) => Promise<FunctionResponse>;
  editAuction: (args: EditAuctionArgs) => Promise<FunctionResponse>;
} => {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { securePost } = useSecureApi();

  const createAuction = async ({
    values,
    imageFile,
  }: CreateAuctionArgs): Promise<FunctionResponse> => {
    try {
      const clientStartDate = parseLocalDateTime(
        values.startDate,
        values.startTime
      );
      const payload = {
        image: imageFile,
        data: {
          ...values,
        },
        clientStartDate,
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.CREATE,
        data: payload,
        options: {
          timeout: 30000,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(msg, 'USE_AUCTION_MUTATION_CREATE - Unexpected error');

      console.error('ERROR_CREATE_AUCTION_CATCH', msg);

      callToast({ variant: 'error', description: AUCTION_CREATION_ERROR });
      return { status: 'error' };
    }
  };

  const editAuction = async ({
    values,
    imageFile,
    removedImages,
    auctionId,
  }: EditAuctionArgs): Promise<FunctionResponse> => {
    try {
      const payload = {
        imageFile,
        removedImages: removedImages,
        auctionId,
        data: {
          ...values,
        },
      };

      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUCTIONS.UPDATE(auctionId),
        data: payload,
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return { status: 'error' };
      }

      callToast({ variant: 'success', description: response.data });
      return { status: 'success' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      sentryErrorReport(msg, 'USE_AUCTION_MUTATION_EDIT - Unexpected error');

      console.error('ERROR_EDIT_AUCTION_CATCH', msg);

      callToast({ variant: 'error', description: AUCTION_UPDATE_ERROR });
      return { status: 'error' };
    }
  };

  return {
    createAuction,
    editAuction,
  };
};
