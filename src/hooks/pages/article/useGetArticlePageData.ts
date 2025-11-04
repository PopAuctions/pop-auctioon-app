import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  BiddingAmounts,
  LangMap,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface UserFollow {
  error: null | string;
  follows: boolean;
}

interface NeighbourArticles {
  previousArticleId: number | null;
  nextArticleId: number | null;
}

type ArticlePageData = [UserFollow, NeighbourArticles, BiddingAmounts];

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
}): Omit<ActionResponse<ArticlePageData | null>, 'refetch'> & {
  refetch: (currentPrice: number) => RefetchReturn;
} => {
  const [data, setData] = useState<ArticlePageData | null>(null);
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

    const res = await protectedGet<ArticlePageData>(
      `/articles/article-page-info?${params}`
    );

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching page info',
        es: 'Error al obtener información de la página',
      });
      return {
        message: {
          en: 'Error fetching page info',
          es: 'Error al obtener información de la página',
        },
      };
    }

    const resData = res.data;
    if (!resData) {
      fetchData();
      return;
    }

    setData(resData);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [articleId, auctionId, currentPrice, startingPrice, protectedGet]);

  const refetch = async (currentPrice: number) => {
    const params = new URLSearchParams();

    if (articleId) params.append('articleId', String(articleId));
    if (startingPrice) params.append('startingPrice', String(startingPrice));

    params.append('currentPrice', String(currentPrice));

    const res = await protectedGet<BiddingAmounts>(
      `/bids/bidding-amounts?${params}`
    );

    if (res.error) {
      setErrorMessage({
        en: 'Error fetching updated bidding amounts',
        es: 'Error al obtener actualizar los montos de puja',
      });
      return {
        message: {
          en: 'Error fetching updated bidding amounts',
          es: 'Error al obtener actualizar los montos de puja',
        },
      };
    }

    const resData = res.data;
    if (!resData) {
      fetchData();
      return;
    }

    if (!data) return;
    const updatedData = [...data];
    updatedData[2] = resData;

    setData([data[0], data[1], resData]);

    return {
      error: null,
      success: null,
      res,
    };
  };

  useEffect(() => {
    if (!articleId || !auctionId || !currentPrice || !startingPrice) return;

    fetchData();
  }, [articleId, auctionId, currentPrice, startingPrice, fetchData]);

  return { data, status, errorMessage, setErrorMessage, refetch };
};
