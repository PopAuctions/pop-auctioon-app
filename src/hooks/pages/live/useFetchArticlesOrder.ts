import { useCallback, useEffect, useRef, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import type {
  ActionResponse,
  CustomArticleLiveAuto,
  Lang,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useToast } from '@/hooks/useToast';
import { SECURE_ENDPOINTS } from '@/config/api-config';

export const useFetchArticlesOrder = ({
  articlesOrderKey,
  locale,
}: {
  articlesOrderKey: string;
  locale: Lang;
}): ActionResponse<CustomArticleLiveAuto[]> => {
  const [articles, setArticles] = useState<CustomArticleLiveAuto[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
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
        description: {
          en: 'Error fetching articles information. Click to retry.',
          es: 'Error al obtener los artículos. Haz clic para reintentar.',
        },
        onAction: fetchArticlesOrder,
      });
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching articles information.',
        es: 'Error al obtener los artículos.',
      });
      return {
        message: {
          en: 'Error fetching articles information.',
          es: 'Error al obtener los artículos.',
        },
      };
    }

    setArticles(res.data || []);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articlesOrderKey, protectedGet, callToast]);

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
