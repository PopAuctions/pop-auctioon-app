import { AuctionStatus } from '@/constants/auctions';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import {
  ActionResponse,
  Article,
  AuctionCategories,
  LangMap,
  RequestStatus,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

interface ArticleWithAuction extends Article {
  Auction: {
    id: number;
    startDate: string;
    status: AuctionStatus;
    title: string;
    category: AuctionCategories;
  };
}

export const useGetArticle = ({
  articleId,
  validateAuctionStatus = false,
  getStatus = false,
  publishedArticle = false,
  getAuctionData = false,
}: {
  articleId: number;
  validateAuctionStatus?: boolean;
  getStatus?: boolean;
  publishedArticle?: boolean;
  getAuctionData?: boolean;
}): ActionResponse<ArticleWithAuction | null> => {
  const [article, setArticle] = useState<ArticleWithAuction | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchArticle = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams();

    if (validateAuctionStatus)
      params.append('validateAuctionStatus', String(validateAuctionStatus));
    if (getStatus) params.append('getStatus', String(getStatus));
    if (publishedArticle)
      params.append('publishedArticle', String(publishedArticle));
    if (getAuctionData) params.append('getAuctionData', String(getAuctionData));

    const res = await protectedGet<ArticleWithAuction>({
      endpoint: `/articles/${articleId}?${params}`,
    });

    if (res.error) {
      setStatus('error');
      setErrorMessage({
        en: 'Error fetching article',
        es: 'Error al obtener el artículo',
      });
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
      };
    }

    setArticle(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [
    articleId,
    getAuctionData,
    getStatus,
    protectedGet,
    publishedArticle,
    validateAuctionStatus,
  ]);

  const refetch = async () => {
    const params = new URLSearchParams();

    if (validateAuctionStatus)
      params.append('validateAuctionStatus', String(validateAuctionStatus));
    if (getStatus) params.append('getStatus', String(getStatus));
    if (publishedArticle)
      params.append('publishedArticle', String(publishedArticle));
    if (getAuctionData) params.append('getAuctionData', String(getAuctionData));

    const res = await protectedGet<ArticleWithAuction>({
      endpoint: `/articles/${articleId}?${params}`,
    });

    if (res.error) {
      return {
        message: {
          en: 'Error fetching article',
          es: 'Error al obtener el artículo',
        },
      };
    }

    setArticle(res.data || null);

    return {
      error: null,
      success: null,
      res,
    };
  };

  useEffect(() => {
    fetchArticle();
  }, [articleId, fetchArticle]);

  return {
    data: article,
    status,
    errorMessage,
    setErrorMessage,
    refetch,
  };
};
