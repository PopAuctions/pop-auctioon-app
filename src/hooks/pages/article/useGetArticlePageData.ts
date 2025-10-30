import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  BiddingAmounts,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface ArticlePageData {
  userFollows: {
    error: null | string;
    follows: boolean;
  };
  neighbourArticles: {
    previousArticleId: number | null;
    nextArticleId: number | null;
  };
  biddingAmounts: BiddingAmounts;
}

export const useGetArticlePageData = ({
  articleId,
  auctionId,
  currentPrice,
  startingPrice,
}: {
  articleId: number;
  auctionId: number;
  currentPrice: number;
  startingPrice: number;
}): ActionResponse<ArticlePageData[] | null> => {
  const [data, setData] = useState<ArticlePageData[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchData = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams();

    if (articleId) params.append('articleId', String(articleId));
    if (auctionId) params.append('auctionId', String(auctionId));
    if (currentPrice) params.append('currentPrice', String(currentPrice));
    if (startingPrice) params.append('startingPrice', String(startingPrice));

    const res = await protectedGet<ArticlePageData[]>(
      `/articles/article-page-info?${params}`
    );
    console.log('FETCH_ARTICLE_PAGE_DATA_RES', res);

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching article',
        es: 'Error al obtener el artículo',
      });
      return {
        message: {
          en: 'Error fetching auction',
          es: 'Error al obtener la subasta',
        },
      };
    }

    const data = res.data;

    if (!data) {
      fetchData();
      return;
    }
    console.log('ARTICLE_PAGE_DATA', data);

    setData(data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, auctionId, currentPrice, startingPrice, protectedGet]);

  useEffect(() => {
    if (!articleId || !auctionId || !currentPrice || !startingPrice) return;

    fetchData();
  }, [articleId, auctionId, currentPrice, startingPrice, fetchData]);

  return { data, status, errorMessage, setErrorMessage };
};
