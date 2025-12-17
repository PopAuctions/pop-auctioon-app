import { ActionResponse, LangMap, RequestStatus } from '@/types/types';
import { useSecureApi } from '../api/useSecureApi';
import { useCallback, useEffect, useState } from 'react';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import type { CountryValue } from '@/types/types';

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
  const { secureGet } = useSecureApi();

  const fetchCommission = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<{
        taxPercentageArticles: number;
        taxForShipping: Record<string, number>;
        commissionsValue: number;
        countries: Record<string, CountryValue[]>;
        countriesLabel: Record<string, Record<CountryValue, string>>;
      }>({
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

      // Transform backend response to match our interface
      setData({
        commission: response.data.commissionsValue,
        shippingTaxes: response.data.taxForShipping,
        taxPercentage: response.data.taxPercentageArticles,
        countries: response.data.countries,
        countriesLabel: response.data.countriesLabel,
      });
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
  }, [secureGet]);

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
