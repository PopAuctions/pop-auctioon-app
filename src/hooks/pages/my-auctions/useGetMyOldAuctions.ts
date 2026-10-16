import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import type { ActionResponse, Auction, RequestStatus } from '@/types/types';
import type { MessageKey } from '@/i18n';

const AUCTIONS_LOAD_ERROR =
  'errors.auction.auctionsLoadFailed' as const satisfies MessageKey;

interface MyOldAuctionsApiResponse {
  data: Auction[] | null;
  total: number;
}

interface UseGetMyOldAuctionsResponse {
  refetch: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  totalItems: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 3;

export const useGetMyOldAuctions = (): ActionResponse<
  Auction[] | null,
  MessageKey
> &
  UseGetMyOldAuctionsResponse => {
  const [auctions, setAuctions] = useState<Auction[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { secureGet } = useSecureApi();

  const fetchAuctions = useCallback(
    async (options?: { keepStatus?: boolean }) => {
      if (!options?.keepStatus) {
        setStatus('loading');
      }

      const res = await secureGet<MyOldAuctionsApiResponse>({
        endpoint: `${SECURE_ENDPOINTS.MY_AUCTIONS.OLD_LIST}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`,
      });

      if (!res || res.error) {
        setStatus('error');
        setErrorMessage(AUCTIONS_LOAD_ERROR);
        setAuctions(null);
        setTotalItems(0);

        return {
          message: AUCTIONS_LOAD_ERROR,
        };
      }

      const payload = res.data;

      setAuctions(payload?.data ?? null);
      setTotalItems(payload?.total ?? 0);
      setStatus('success');

      return {
        error: null,
        success: null,
        res,
      };
    },
    [secureGet, page]
  );

  const refetchAuctions = useCallback(async () => {
    await fetchAuctions({ keepStatus: true });
  }, [fetchAuctions]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const totalPages = Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctions,

    page,
    setPage,
    totalItems,
    totalPages,
  };
};
