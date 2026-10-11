import { CustomArticleSecondChance } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { MessageKey } from '@/i18n';

const LIST_LOAD_ERROR =
  'errors.onlineStoreArticle.listLoadFailed' satisfies MessageKey;

type FetchArticlesResult =
  | { error: MessageKey; data: CustomArticleSecondChance[] }
  | { error: null; data: CustomArticleSecondChance[] };

export const useFetchMyOnlineStoreArticlesInfinite = () => {
  const { secureGet } = useSecureApi();

  const fetchArticles = useCallback(
    async ({
      brand,
      model,
      codeNumber,
      status,
      offersStatus,
      offset = 0,
      limit = 10,
    }: {
      brand?: string;
      model?: string;
      codeNumber?: string;
      status?: string;
      offersStatus?: string;
      offset?: number;
      limit?: number;
    }): Promise<FetchArticlesResult> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (brand) params.append('brand', brand);
      if (model) params.append('model', model);
      if (codeNumber) params.append('codeNumber', codeNumber);
      if (status) params.append('status', status);
      if (offersStatus) params.append('offers', offersStatus);

      const res = await secureGet<CustomArticleSecondChance[]>({
        endpoint: `${SECURE_ENDPOINTS.MY_ONLINE_STORE.ARTICLES}?${params.toString()}`,
      });

      if (res.error) {
        return {
          error: LIST_LOAD_ERROR,
          data: [],
        };
      }

      return { error: null, data: res.data ?? [] };
    },
    [secureGet]
  );

  return { fetchArticles };
};
