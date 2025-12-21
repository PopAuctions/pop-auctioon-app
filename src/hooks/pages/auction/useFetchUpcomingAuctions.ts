import { useCallback, useEffect, useState } from 'react';
import { REQUEST_STATUS } from '@/constants';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { ActionResponse, Auction, LangMap, RequestStatus } from '@/types/types';

export const useFetchUpcomingAuctions = (): ActionResponse<Auction[]> => {
  const [auctions, setUpcomingAuctions] = useState<Auction[]>([]);
  const [status, setStatus] = useState<RequestStatus>(REQUEST_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchUpcomingAuctions = useCallback(async () => {
    setStatus(REQUEST_STATUS.loading);
    const res = await protectedGet<Auction[]>({
      endpoint: `/auctions/upcoming`,
    });

    if (res.error) {
      setStatus(REQUEST_STATUS.error);
      setErrorMessage({
        en: 'Error fetching upcoming auctions',
        es: 'Error al obtener las subastas próximas',
      });
      return {
        message: {
          en: 'Error fetching upcoming auctions',
          es: 'Error al obtener las subastas próximas',
        },
      };
    }

    setUpcomingAuctions(res.data || []);
    setStatus(REQUEST_STATUS.success);

    return {
      error: null,
      success: null,
      res,
    };
  }, [protectedGet]);

  useEffect(() => {
    fetchUpcomingAuctions();
  }, [fetchUpcomingAuctions]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
  };
};
