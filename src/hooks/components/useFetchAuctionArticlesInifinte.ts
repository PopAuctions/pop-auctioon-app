import { SimpleArticle } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback } from 'react';

export const useFetchAuctionArticlesInfinite = () => {
  const { protectedGet } = useSecureApi();

  const fetchArticles = useCallback(
    async ({
      auctionId,
      brand,
      price,
      offset = 0,
      limit = 10,
      orderedIds,
    }: {
      auctionId: string | number;
      brand?: string;
      price?: string;
      offset?: number;
      limit?: number;
      orderedIds?: number[];
    }) => {
      const params = new URLSearchParams({
        auctionId: String(auctionId),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (brand) params.append('brand', brand);
      if (price) params.append('price', price);
      if (orderedIds) params.append('orderedIds', JSON.stringify(orderedIds));

      const res = await protectedGet<SimpleArticle[]>(
        `/articles/infinite?${params}`
      );

      return res;
    },
    [protectedGet]
  );

  return { fetchArticles };
};
