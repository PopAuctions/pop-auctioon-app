import { useCallback, useEffect, useRef, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  CustomArticleLiveAuto,
  Lang,
  RequestStatus,
} from '@/types/types';
import { useToast } from '@/hooks/useToast';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { t } from '@/i18n';
import type { MessageKey } from '@/i18n';

const ARTICLES_LOAD_ERROR =
  'errors.live.articlesLoadFailed' as const satisfies MessageKey;
const ARTICLES_LOAD_RETRY_ERROR =
  'errors.live.articlesLoadRetry' as const satisfies MessageKey;

export const useFetchArticlesOrder = ({
  articlesOrderKey,
  locale,
}: {
  articlesOrderKey: string;
  locale: Lang;
}): ActionResponse<CustomArticleLiveAuto[], MessageKey> => {
  const [articles, setArticles] = useState<CustomArticleLiveAuto[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();
  const { callToast } = useToast(locale);
  const fetchedKeyRef = useRef<string | null>(null);

  const fetchArticlesOrder = useCallback(async () => {
    setStatus('loading');

    const res = await protectedGet<CustomArticleLiveAuto[]>({
      endpoint: `${SECURE_ENDPOINTS.LIVE.ARTICLES}?ids=${articlesOrderKey}`,
    });

    if (res.error) {
      callToast({
        variant: 'error',
        description: ARTICLES_LOAD_RETRY_ERROR,
        actionLabel: t('commonErrors.retryButton', { locale }),
        onAction: fetchArticlesOrder,
        durationMs: 7000,
      });
      setStatus('error');
      setErrorMessage(ARTICLES_LOAD_ERROR);
      return {
        message: ARTICLES_LOAD_ERROR,
      };
    }

    setArticles(res.data || []);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articlesOrderKey, protectedGet, callToast, locale]);

  useEffect(() => {
    if (!articlesOrderKey || articlesOrderKey.length === 0) return;

    if (fetchedKeyRef.current === articlesOrderKey) return;
    fetchedKeyRef.current = articlesOrderKey;

    fetchArticlesOrder();
  }, [articlesOrderKey, fetchArticlesOrder]);

  return {
    data: articles,
    status,
    errorMessage,
    setErrorMessage,
  };
};
