import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { AuctioneerPayoutDashboard } from '@/types/payouts';
import type { ActionResponse, RequestStatus } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import type { MessageKey } from '@/i18n';

const AUCTIONEER_PAYOUT_DASHBOARD_LOAD_FAILED =
  'errors.auction.auctionsLoadFailed' as const satisfies MessageKey;

export const useGetAuctioneerPayoutDashboard = (): ActionResponse<
  AuctioneerPayoutDashboard | null,
  MessageKey
> => {
  const [auctions, setAuctions] = useState<AuctioneerPayoutDashboard | null>(
    null
  );
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<MessageKey | null>(null);
  const { secureGet } = useSecureApi();

  const fetchStorePayoutsDachboard = useCallback(async () => {
    setStatus('loading');

    const res = await secureGet<AuctioneerPayoutDashboard>({
      endpoint: `${SECURE_ENDPOINTS.STORE.PAYOUTS.DASHBOARD}`,
    });

    if (res.error) {
      setStatus('error');
      const messageCode =
        res.messageCode ?? AUCTIONEER_PAYOUT_DASHBOARD_LOAD_FAILED;
      setErrorMessage(messageCode);
      return {
        message: messageCode,
      };
    }

    setAuctions(res.data || null);
    setStatus('success');

    return {
      error: null,
      success: null,
      res,
    };
  }, [secureGet]);

  const refetchAuctionsMade = useCallback(async () => {
    const res = await secureGet<AuctioneerPayoutDashboard>({
      endpoint: `${SECURE_ENDPOINTS.STORE.PAYOUTS.DASHBOARD}`,
    });

    if (res.error) {
      return;
    }

    setAuctions(res.data || null);

    return;
  }, [secureGet]);

  useEffect(() => {
    fetchStorePayoutsDachboard();
  }, [fetchStorePayoutsDachboard]);

  return {
    data: auctions,
    status,
    errorMessage,
    setErrorMessage,
    refetch: refetchAuctionsMade,
  };
};
