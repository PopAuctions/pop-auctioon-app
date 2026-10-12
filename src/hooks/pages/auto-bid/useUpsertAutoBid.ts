import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { RequestStatus } from '@/types/types';
import { useCallback, useState } from 'react';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { resolveApiResponseMessage } from '@/i18n/api-message';
import type { MessageKey } from '@/i18n';

const AUTO_BID_SAVE_FAILED =
  'errors.bid.automaticBidFailed' as const satisfies MessageKey;
const AUTO_BID_SAVED =
  'autoBid.savedSuccessfully' as const satisfies MessageKey;

export const useUpsertAutoBid = (): {
  upsertAutoBid: ({
    articleId,
    maxAmount,
  }: {
    articleId: number;
    maxAmount: number;
  }) => Promise<{ error: string | null; success: string | null }>;
  status: RequestStatus;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const { securePost } = useSecureApi();
  const { locale } = useTranslation();

  const upsertAutoBid = useCallback(
    async ({
      articleId,
      maxAmount,
    }: {
      articleId: number;
      maxAmount: number;
    }) => {
      setStatus('loading');

      const res = await securePost<unknown>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.CREATE,
        data: {
          articleId: Number(articleId),
          maxAmount: Number(maxAmount),
        },
      });

      if (res.error) {
        setStatus('error');
        return {
          error: resolveApiResponseMessage(
            res,
            'error',
            locale,
            AUTO_BID_SAVE_FAILED
          ),
          success: null,
        };
      }

      setStatus('success');
      return {
        error: null,
        success: resolveApiResponseMessage(
          res,
          'success',
          locale,
          AUTO_BID_SAVED
        ),
      };
    },
    [securePost, locale]
  );

  return {
    upsertAutoBid,
    status,
  };
};
