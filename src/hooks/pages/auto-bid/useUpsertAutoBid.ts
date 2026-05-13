import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type { LangMap, RequestStatus } from '@/types/types';
import { useCallback, useState } from 'react';

export const useUpsertAutoBid = (): {
  upsertAutoBid: ({
    articleId,
    maxAmount,
  }: {
    articleId: number;
    maxAmount: number;
  }) => Promise<{ error: LangMap | null; success: LangMap | null }>;
  status: RequestStatus;
} => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const { securePost } = useSecureApi();

  const upsertAutoBid = useCallback(
    async ({
      articleId,
      maxAmount,
    }: {
      articleId: number;
      maxAmount: number;
    }) => {
      setStatus('loading');

      const res = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.AUTO_BID.CREATE,
        data: {
          articleId: Number(articleId),
          maxAmount: Number(maxAmount),
        },
      });

      if (res.error) {
        setStatus('error');
        return {
          error: res.error,
          success: null,
        };
      }

      setStatus('success');
      return {
        error: null,
        success: res.data ?? {
          es: 'Automatic bid saved successfully',
          en: 'Puja automática guardada con éxito',
        },
      };
    },
    [securePost]
  );

  return {
    upsertAutoBid,
    status,
  };
};
