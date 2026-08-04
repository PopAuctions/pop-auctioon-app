import { CustomArticleSecondChance } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback } from 'react';

export const useFetchOnlineStoreArticlesInfinite = () => {
  const { protectedGet } = useSecureApi();

  const fetchArticles = useCallback(
    async ({
      brand,
      price,
      model,
      color,
      material,
      sortBy,
      offset = 0,
      limit = 10,
    }: {
      brand?: string;
      price?: string;
      model?: string;
      color?: string;
      material?: string;
      sortBy?: string;
      offset?: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (brand) params.append('brand', brand);
      if (price) params.append('price', price);
      if (model) params.append('model', model);
      if (color) params.append('color', color);
      if (material) params.append('material', material);

      params.append('sortBy', sortBy ?? '');

      const res = await protectedGet<CustomArticleSecondChance[]>({
        endpoint: `/online-store/articles/infinite?${params}`,
      });

      return res;
    },
    [protectedGet]
  );

  return { fetchArticles };
};
