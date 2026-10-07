import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  BiddingAmounts,
  RefetchReturn,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const ARTICLE_PAGE_INFO_LOAD_ERROR =
  'errors.article.pageInfoLoadFailed' as const satisfies MessageKey;
const BIDDING_AMOUNTS_LOAD_ERROR =
  'errors.article.updatedBiddingAmountsLoadFailed' as const satisfies MessageKey;

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
}): Omit<ActionResponse<ArticlePageData | null, MessageKey>, 'refetch'> & {
  refetch: (currentPrice: number) => RefetchReturn<MessageKey>;
} => {
  const [data, setData] = useState<ArticlePageData | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchData = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams();

    if (articleId) params.append('articleId', String(articleId));
    if (auctionId) params.append('auctionId', String(auctionId));
    if (currentPrice) params.append('currentPrice', String(currentPrice));
    if (startingPrice) params.append('startingPrice', String(startingPrice));

    const res = await protectedGet<ArticlePageData>({
      endpoint: `/articles/article-page-info?${params}`,
      secureHeader: true,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage(ARTICLE_PAGE_INFO_LOAD_ERROR);
      return {
        message: ARTICLE_PAGE_INFO_LOAD_ERROR,
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

    const res = await protectedGet<BiddingAmounts>({
      endpoint: `/bids/bidding-amounts?${params}`,
    });

    if (res.error) {
      setErrorMessage(BIDDING_AMOUNTS_LOAD_ERROR);
      return {
        message: BIDDING_AMOUNTS_LOAD_ERROR,
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
