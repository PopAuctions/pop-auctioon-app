import { useSecureApi } from '../api/useSecureApi';
import { useCallback } from 'react';

export const useFetchOnlineStoreArticlesSuggestions = () => {
  const { protectedGet } = useSecureApi();

  const getSecondChanceArticleSuggestions = useCallback(
    async ({ search }: { search?: string }) => {
      if (!search || search.length < 2) return;

      const params = new URLSearchParams({
        search: search.toString(),
      });

      const res = await protectedGet<string[]>({
        endpoint: `/online-store/articles/suggestions?${params}`,
      });

      return res?.data ?? [];
    },
    [protectedGet]
  );

  return { getSecondChanceArticleSuggestions };
};
