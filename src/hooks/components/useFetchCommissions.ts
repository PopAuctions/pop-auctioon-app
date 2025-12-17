import {
  ActionResponse,
  LangMap,
  RequestStatus,
  CountryValue,
} from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

interface PaymentConfigData {
  commission: number;
  shippingTaxes: Record<string, number>;
  taxPercentage: number;
  countries: Record<string, CountryValue[]>;
  countriesLabel: Record<string, Record<CountryValue, string>>;
}

export const useFetchCommissions = (): ActionResponse<PaymentConfigData> => {
  const [data, setData] = useState<PaymentConfigData>({
    commission: 0,
    shippingTaxes: {},
    taxPercentage: 0,
    countries: {},
    countriesLabel: {},
  });
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedGet } = useSecureApi();

  const fetchCommission = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await protectedGet<PaymentConfigData>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.INFO,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus('error');
        setErrorMessage({
          en: 'Payment configuration data is missing',
          es: 'Faltan los datos de configuración de pago',
        });
        return;
      }

      setData(response.data);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_FETCH_COMMISSION - Unexpected error');

      const message: LangMap = {
        en: 'Error fetching commission data',
        es: 'Error al cargar la comisión',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [protectedGet]);

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);
  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
  };
};
