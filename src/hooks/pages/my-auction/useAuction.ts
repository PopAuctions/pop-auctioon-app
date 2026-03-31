import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { AnyArticleFormValues, LangMap } from '@/types/types';

interface FunctionResponse {
  status: 'success' | 'error';
}

interface CreateAuctionArgs {
  values: AnyArticleFormValues;
  imageFile: string;
}

interface EditAuctionArgs {
  values: AnyArticleFormValues;
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
      const payload = {
        imageFile,
        data: {
          ...values,
        },
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

      const message: LangMap = {
        en: 'Error creating auction',
        es: 'Error al crear la subasta',
      };

      callToast({ variant: 'error', description: message });
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

      const message: LangMap = {
        en: 'Error updating auction',
        es: 'Error al actualizar la subasta',
      };

      callToast({ variant: 'error', description: message });
      return { status: 'error' };
    }
  };

  return {
    createAuction,
    editAuction,
  };
};
